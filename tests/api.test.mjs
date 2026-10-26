import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createChatHandler } from '../api/chat.js';
import { createStatusHandler } from '../api/status.js';
import { clearLocalLimitsForTests, checkRateLimit, configuration } from '../lib/protection.js';

const env = { NODE_ENV: 'test', OPENAI_API_KEY: 'test-placeholder-not-a-real-key' };
const base = { message: 'Explain one-step equations.', mode: 'learn', history: [], profile: { level: 'secondary' }, notes: '' };
const answer = { answer: 'Subtract 3 from both sides, then divide by 2.', strategy: 'EXPLAIN', practice: { topic: 'One-step equations', question: 'Solve x + 2 = 5.', options: ['2','3','7'], correctIndex: 1, explanation: 'Subtract 2 from both sides to get x = 3.' } };
const independentAnswer = { valid: true, correctIndex: 1, reason: 'Subtract 2 from both sides to get x = 3.' };
function provider(value = answer) {
  return { ok: true, status: 200, json: async () => ({ status: 'completed', model: 'test-model', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }], usage: { input_tokens: 120, output_tokens: 80 } }) };
}
function providerWithUsage(value, usage) {
  const result=provider(value);
  const read=result.json;
  result.json=async()=>({...await read(),usage});
  return result;
}
function request(body = base, extra = {}) {
  return { method: 'POST', headers: { host: 'localhost:3000', origin: 'http://localhost:3000', 'content-type': 'application/json' }, body, socket: { remoteAddress: '127.0.0.1' }, ...extra };
}
function response() {
  const res = new EventEmitter();
  res.headers = {};
  res.writableEnded = false;
  res.setHeader = (key,value) => { res.headers[key.toLowerCase()] = value; };
  res.end = body => { res.body = body ? JSON.parse(body) : null; res.writableEnded = true; };
  return res;
}
async function call(req, options = {}) {
  const res = response();
  await createChatHandler({ env, fetchImpl: async (_url, init) => provider(JSON.parse(init.body).text?.format?.name === 'padi_independent_practice_check' ? independentAnswer : answer), ...options })(req,res);
  return res;
}
beforeEach(clearLocalLimitsForTests);

test('learning request reaches Responses API with bounded schema and stateless storage', async () => {
  const calls = [];
  const res = await call(request(), { fetchImpl: async (url, init) => { const body = { url, ...JSON.parse(init.body) }; calls.push(body); return provider(body.text?.format?.name === 'padi_independent_practice_check' ? independentAnswer : answer); } });
  const sent = calls[0];
  assert.equal(res.statusCode,200);
  assert.equal(sent.url,'https://api.openai.com/v1/responses');
  assert.equal(sent.store,false);
  assert.equal(sent.text.format.type,'json_schema');
  assert.equal(sent.text.format.strict,true);
  assert.equal(sent.tools,undefined);
  assert.equal(res.body.practice.correctIndex,1);
  assert.ok(res.body.practice.id);
  assert.equal(res.body.meta.inputTokens,240);
  assert.equal(res.body.meta.outputTokens,160);
  assert.equal(res.body.meta.modelCalls,2);
  assert.equal(res.body.meta.practiceCheck,'independent-ai');
  assert.equal(calls[1].store,false);
  assert.deepEqual(JSON.parse(calls[1].input),{question:answer.practice.question,options:answer.practice.options});
  assert.equal(res.headers['cache-control'],'no-store, private');
  assert.equal(res.body.sources.length,0);
});

test('semantically inconsistent practice keys are omitted instead of graded',async()=>{
  const proposed={...answer,practice:{topic:'Equations',question:'Solve 2x + 7 = 19.',options:['x = 4','x = 5','x = 6','x = 7'],correctIndex:1,explanation:'Subtract 7, then divide by 2: x = 6.'}};
  const sent=[];
  const res=await call(request(),{fetchImpl:async(_url,init)=>{
    const body=JSON.parse(init.body);sent.push({body,signal:init.signal});
    return provider(sent.length===1?proposed:{valid:true,correctIndex:2,reason:'2x = 12, so x = 6.'});
  }});
  assert.equal(res.statusCode,200);
  assert.equal(res.body.practice,null);
  assert.equal(res.body.meta.practiceCheck,'omitted');
  assert.equal(res.body.meta.modelCalls,2);
  assert.equal(res.body.meta.inputTokens,240);
  assert.ok(res.body.warnings.some(warning=>warning.includes('could not be independently confirmed')));
  assert.deepEqual(JSON.parse(sent[1].body.input),{question:proposed.practice.question,options:proposed.practice.options});
  assert.equal(sent[0].signal,sent[1].signal,'Both calls share one overall timeout/cancellation signal.');
});

test('independent check outages or ambiguity omit practice while retaining the explanation',async()=>{
  for(const check of ['outage','ambiguous']){
    let calls=0;
    const res=await call(request(),{fetchImpl:async()=>{
      calls++;
      if(calls===1)return provider();
      if(check==='outage')throw new Error('provider unavailable');
      return provider({valid:false,correctIndex:-1,reason:'The question is ambiguous.'});
    }});
    assert.equal(res.statusCode,200);
    assert.equal(res.body.answer,answer.answer);
    assert.equal(res.body.practice,null);
    assert.equal(res.body.meta.practiceCheck,'omitted');
    assert.equal(res.body.meta.modelCalls,2);
    assert.ok(res.body.warnings.some(warning=>warning.includes('No practice score was recorded')));
  }
});

test('independently accepted practice uses independent reasoning and warns of remaining uncertainty',async()=>{
  let calls=0;
  const res=await call(request(),{fetchImpl:async()=>{
    calls++;
    return provider(calls===1?answer:{valid:true,correctIndex:1,reason:'Taking 2 away from both sides leaves x equal to 3.'});
  }});
  assert.equal(res.body.practice.correctIndex,1);
  assert.match(res.body.practice.explanation,/Taking 2 away/);
  assert.ok(res.body.warnings.some(warning=>warning.includes('may still contain errors')));
});

test('paid calls preserve missing or partial token usage as unknown rather than zero',async()=>{
  const noPractice={...answer,practice:null};
  for(const [usage,expectedInput,expectedOutput] of [
    [undefined,null,null],
    [{input_tokens:100},100,null],
    [{output_tokens:40},null,40],
    [{input_tokens:0,output_tokens:0},0,0],
    [{input_tokens:'100',output_tokens:-1},null,null],
  ]){
    const res=await call(request(),{fetchImpl:async()=>providerWithUsage(noPractice,usage)});
    assert.equal(res.statusCode,200);
    assert.equal(res.body.meta.modelCalls,1);
    assert.equal(res.body.meta.inputTokens,expectedInput);
    assert.equal(res.body.meta.outputTokens,expectedOutput);
  }
});

test('two-call usage totals become unknown only for the field with an unmeasured call',async()=>{
  for(const [first,second,expectedInput,expectedOutput] of [
    [{input_tokens:100,output_tokens:40},{input_tokens:20,output_tokens:10},120,50],
    [{input_tokens:100},{input_tokens:20,output_tokens:10},120,null],
    [{input_tokens:100,output_tokens:40},{output_tokens:10},null,50],
    [undefined,{input_tokens:20,output_tokens:10},null,null],
  ]){
    let calls=0;
    const res=await call(request(),{fetchImpl:async()=>{
      calls++;
      return providerWithUsage(calls===1?answer:independentAnswer,calls===1?first:second);
    }});
    assert.equal(res.statusCode,200);
    assert.equal(res.body.meta.modelCalls,2);
    assert.equal(res.body.meta.inputTokens,expectedInput);
    assert.equal(res.body.meta.outputTokens,expectedOutput);
  }
});

test('a checker outage leaves aggregate paid usage unknown',async()=>{
  let calls=0;
  const res=await call(request(),{fetchImpl:async()=>{
    calls++;
    if(calls===1)return provider();
    throw new Error('Unmeasured checker request');
  }});
  assert.equal(res.statusCode,200);
  assert.equal(res.body.meta.modelCalls,2);
  assert.equal(res.body.meta.inputTokens,null);
  assert.equal(res.body.meta.outputTokens,null);
});

test('does not send provider calls for invalid methods, origins or institutional claims', async () => {
  let calls = 0;
  const fetchImpl = async () => { calls++; return provider(); };
  for (const [req, status] of [
    [request(base,{method:'GET'}),405],
    [request(base,{headers:{host:'localhost:3000',origin:'https://attacker.example','content-type':'application/json'}}),403],
    [request({...base,tenant:'school-123'}),400],
    [request({...base,profile:{level:'primary',role:'teacher'}}),400],
    [request({...base,mode:'institutional'}),400],
  ]) {
    assert.equal((await call(req,{fetchImpl})).statusCode,status);
  }
  assert.equal(calls,0);
});

test('bounds request text, history, body size and content type', async () => {
  for (const [req,status] of [
    [request({...base,message:'x'.repeat(4001)}),400],
    [request({...base,notes:'x'.repeat(12001)}),400],
    [request({...base,history:Array.from({length:13},()=>({role:'user',content:'hello'}))}),400],
    [request({...base,message:''}),400],
    [request('{not-json'),400],
    [request(base,{headers:{host:'localhost:3000',origin:'http://localhost:3000','content-type':'text/plain'}}),415],
    [request(base,{headers:{host:'localhost:3000',origin:'http://localhost:3000','content-type':'application/json','content-length':'999999'}}),413],
  ]) assert.equal((await call(req)).statusCode,status);
});

test('blocks obvious secrets before provider transmission', async () => {
  const key = 'sk-proj-' + 'a'.repeat(40);
  let calls=0;
  const res = await call(request({...base,message:'Please store '+key}),{fetchImpl:async()=>{calls++;return provider();}});
  assert.equal(res.statusCode,400);
  assert.equal(res.body.error.code,'PRIVATE_DATA');
  assert.equal(calls,0);
  assert.ok(!JSON.stringify(res.body).includes(key));
  for(const field of ['subject','area']){
    const profile=await call(request({...base,profile:{level:'secondary',[field]:key}}),{fetchImpl:async()=>{calls++;return provider();}});
    assert.equal(profile.statusCode,400);
    assert.equal(profile.body.error.code,'PRIVATE_DATA');
  }
  assert.equal(calls,0);
});

test('production fails closed until both enablement and distributed protection exist', async () => {
  let calls=0;
  const req=request(base,{headers:{host:'padiai.vercel.app',origin:'https://padiai.vercel.app','content-type':'application/json'}});
  for(const production of [
    {NODE_ENV:'production',OPENAI_API_KEY:'test'},
    {NODE_ENV:'production',PADI_AI_ENABLED:'true',OPENAI_API_KEY:'test'},
  ]) {
    const res=await call(req,{env:production,fetchImpl:async()=>{calls++;return provider();}});
    assert.equal(res.statusCode,503);
  }
  assert.equal(calls,0);
  assert.equal(configuration({NODE_ENV:'production',OPENAI_API_KEY:'test',PADI_AI_ENABLED:'true'}).ready,false);
});

test('owner-attested protected preview is enabled only on an actual Vercel preview',async()=>{
  const previewEnv={NODE_ENV:'production',VERCEL:'1',VERCEL_ENV:'preview',PADI_PROTECTED_PREVIEW:'true',PADI_AI_ENABLED:'true',OPENAI_API_KEY:'placeholder'};
  assert.deepEqual(configuration(previewEnv),{ready:true,protection:'protected-preview'});
  let externalCalls=0;
  assert.equal(await checkRateLimit(request(),previewEnv,async()=>{externalCalls++;throw new Error('No external limiter expected');}),'protected-preview');
  assert.equal(externalCalls,0);
  const res=response();
  createStatusHandler(previewEnv)({method:'GET'},res);
  assert.equal(res.body.ready,true);
  assert.equal(res.body.protection,'protected-preview');
  assert.equal(res.body.previewOnly,true);
  assert.equal(res.body.usageLimitScope,'instance-backstop');
  assert.equal(configuration({...previewEnv,PADI_AI_ENABLED:'false'}).ready,false);
  assert.equal(configuration({...previewEnv,OPENAI_API_KEY:''}).ready,false);
});

test('protected-preview flag cannot bypass normal public production protection',()=>{
  const fields={NODE_ENV:'production',VERCEL:'1',VERCEL_ENV:'preview',PADI_PROTECTED_PREVIEW:'true',PADI_AI_ENABLED:'true',OPENAI_API_KEY:'placeholder'};
  for(const invalid of [
    {...fields,VERCEL_ENV:'production'},
    {...fields,VERCEL_ENV:undefined},
    {...fields,VERCEL:undefined},
    {...fields,VERCEL:'true'},
    {...fields,PADI_PROTECTED_PREVIEW:undefined},
    {...fields,PADI_PROTECTED_PREVIEW:'false'},
  ]) assert.deepEqual(configuration(invalid),{ready:false,protection:'unconfigured'});
  assert.equal(configuration({...fields,NODE_ENV:'development',VERCEL:undefined}).protection,'local','External development does not become a protected preview.');
});

test('urgent safeguarding works without a configured AI or external call', async () => {
  let calls=0;
  const res=await call(request({...base,message:'I want to kill myself tonight.'}),{env:{NODE_ENV:'test'},fetchImpl:async()=>{calls++;throw new Error();}});
  assert.equal(res.statusCode,200);
  assert.equal(res.body.strategy,'ESCALATE');
  assert.equal(res.body.meta.grounding,'safety');
  assert.match(res.body.answer,/trusted|trust/);
  assert.match(res.body.answer,/cannot contact anyone/);
  assert.equal(calls,0);
});

test('provider errors never expose secrets or raw messages', async () => {
  const res=await call(request(),{fetchImpl:async()=>({ok:false,status:401,json:async()=>({error:{code:'invalid_api_key',message:'secret customer text sk-proj-private'}})})});
  assert.equal(res.statusCode,503);
  assert.equal(res.body.error.code,'AI_UNAVAILABLE');
  assert.doesNotMatch(JSON.stringify(res.body),/secret customer|sk-proj|invalid_api_key/);
});

test('incomplete or malformed provider responses are not presented as successful answers', async()=>{
  const incomplete=await call(request(),{fetchImpl:async()=>({ok:true,status:200,json:async()=>({status:'incomplete',output:[]})})});
  assert.equal(incomplete.statusCode,502);
  const invalid=await call(request(),{fetchImpl:async()=>provider({answer:'',strategy:'MAGIC',practice:null})});
  assert.equal(invalid.statusCode,502);
});

test('provider timeouts return a recoverable error without inventing an answer',async()=>{
  const res=await call(request(),{fetchImpl:async()=>{throw new DOMException('request timed out','TimeoutError');}});
  assert.equal(res.statusCode,504);
  assert.equal(res.body.error.code,'AI_TIMEOUT');
});

test('closing a response cancels upstream work and does not write a late answer',async()=>{
  const req=request();
  const res=response();
  let started;
  const waiting=new Promise(resolve=>{started=resolve;});
  const handler=createChatHandler({env,fetchImpl:async(_url,init)=>{
    started();
    await new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>reject(new DOMException('cancelled','AbortError')),{once:true}));
  }});
  const pending=handler(req,res);
  await waiting;
  res.emit('close');
  await pending;
  assert.equal(res.body,undefined);
  assert.equal(res.writableEnded,false);
});

test('research forces web search and exposes only actual safe citation annotations',async()=>{
  let body;
  const res=await call(request({...base,mode:'research',message:'Find official sources for an application requirement.'}),{fetchImpl:async(_url,init)=>{
    body=JSON.parse(init.body);
    return {ok:true,status:200,json:async()=>({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'Check the official page. Source',annotations:[{type:'url_citation',url:'https://example.gov.ng/requirements',title:'Official requirements',start_index:25,end_index:31},{type:'url_citation',url:'javascript:alert(1)',title:'Bad'}]}]}]})};
  }});
  assert.equal(res.statusCode,200);
  assert.equal(body.tool_choice,'required');
  assert.equal(body.tools[0].type,'web_search');
  assert.equal(body.model,'gpt-5.6-terra');
  assert.equal(res.body.meta.searched,true);
  assert.equal(res.body.sources.length,1);
  assert.equal(res.body.sources[0].url,'https://example.gov.ng/requirements');
  assert.equal(res.body.practice,null);
  assert.equal(res.body.meta.modelCalls,1);
});

test('research with mismatched authority attribution fails closed instead of showing a wrong citation',async()=>{
  const res=await call(request({...base,mode:'research',message:'Find CBN information on investment safety.'}),{fetchImpl:async()=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'The CBN warns about this [1].',annotations:[{type:'url_citation',url:'https://sec.gov.ng/investor-alerts/',title:'SEC alert'}]}]}]})})});
  assert.equal(res.statusCode,502);
  assert.equal(res.body.error.code,'GROUNDING_UNAVAILABLE');
});

test('open-now research always distinguishes a listing from confirmed availability',async()=>{
  const res=await call(request({...base,mode:'research',message:'Find an open pharmacy in Lekki right now.'}),{fetchImpl:async()=>({ok:true,status:200,json:async()=>({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'A pharmacy is listed as 24-hour. Contact it to confirm.',annotations:[{type:'url_citation',url:'https://example.com/pharmacy',title:'Pharmacy listing'}]}]}]})})});
  assert.equal(res.statusCode,200);
  assert.ok(res.body.warnings.some(warning=>warning.includes('Contact the business to confirm before travelling')));
});

test('research without completed search and supporting sources fails transparently',async()=>{
  for(const output of [
    [{type:'message',content:[{type:'output_text',text:'A confident unsourced answer.'}]}],
    [{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'No sources.'}]}],
  ]) {
    const res=await call(request({...base,mode:'research'}),{fetchImpl:async()=>({ok:true,status:200,json:async()=>({status:'completed',output})})});
    assert.equal(res.statusCode,502);
    assert.equal(res.body.error.code,'GROUNDING_UNAVAILABLE');
  }
});

test('research starter clarification makes no provider request even before AI is configured',async()=>{
  let calls=0;
  const res=await call(request({...base,mode:'research',message:'Help me verify a claim. Ask me the claim and where I saw it. Distinguish evidence, inference and anything unknown.'}),{env:{NODE_ENV:'test'},fetchImpl:async()=>{calls++;return provider();}});
  assert.equal(res.statusCode,200);
  assert.equal(res.body.strategy,'CLARIFY');
  assert.equal(res.body.meta.searched,false);
  assert.equal(res.body.meta.grounding,'clarification');
  assert.equal(calls,0);
});

test('durable limiter uses an atomic counter and fails closed on limiter outage',async()=>{
  const protectedEnv={...env,NODE_ENV:'production',PADI_AI_ENABLED:'true',UPSTASH_REDIS_REST_URL:'https://redis.example',UPSTASH_REDIS_REST_TOKEN:'placeholder'};
  let command;
  assert.equal(await checkRateLimit(request(),protectedEnv,async(_url,init)=>{command=JSON.parse(init.body);return {ok:true,json:async()=>({result:[1,1,1]})};}),'durable');
  assert.equal(command[0],'EVAL');
  await assert.rejects(checkRateLimit(request(),protectedEnv,async()=>{throw new Error('connection');}),error=>error.code==='PROTECTION_UNAVAILABLE');
  await assert.rejects(checkRateLimit(request(),protectedEnv,async()=>({ok:true,json:async()=>({result:[999,999,999]})})),error=>error.code==='RATE_LIMITED');
});

test('status reports capabilities without returning credentials or institution access',()=>{
  const res=response();
  createStatusHandler(env)({method:'GET'},res);
  assert.equal(res.statusCode,200);
  assert.equal(res.body.deploymentMode,'consumer');
  assert.equal(res.body.institutionConnected,false);
  assert.ok(!JSON.stringify(res.body).includes(env.OPENAI_API_KEY));
  assert.equal(res.headers['cache-control'],'no-store');
});
