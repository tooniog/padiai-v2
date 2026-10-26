import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePayload } from '../lib/contracts.js';
import { buildInstructions, needsSearch, validatePractice, localResponse, safeSourceUrl, researchClarification, liveTravelRequest, assertResearchGrounding, RESPONSE_SCHEMA } from '../lib/intelligence.js';

const question={message:'Explain linear equations.',mode:'learn',history:[],profile:{level:'secondary',language:'pcm',subject:'Mathematics',goal:'Understand algebra',style:'steps',area:'Lagos'},notes:''};

test('essential-savings guarantee requests get bounded help without invented financial sourcing',()=>{
  const answer=localResponse({...question,mode:'ask',message:'Which investment should I put all my rent savings into this week to guarantee a 20% monthly return?'});
  assert.equal(answer.meta.modelCalls,0);
  assert.equal(answer.meta.searched,false);
  assert.equal(answer.practice,null);
  assert.deepEqual(answer.sources,[]);
  assert.match(answer.answer,/cannot guarantee/);
  assert.match(answer.answer,/qualified/);
  assert.match(answer.warnings[0],/not a personalised recommendation/);
  assert.equal(localResponse({...question,message:'Explain compound interest using a simple example.'}),null);
});

test('profile and history are bounded explicit data rather than invented memory',()=>{
  const payload=validatePayload({...question,history:[{role:'user',content:'I subtracted incorrectly.'}]});
  assert.equal(payload.profile.level,'secondary');
  assert.equal(payload.history.length,1);
  assert.throws(()=>validatePayload({...question,profile:{...question.profile,mastery:99}}),error=>error.code==='INVALID_INPUT');
});

test('learning instructions include diagnosis, correction, independence and institutional boundaries',()=>{
  const prompt=buildInstructions(question,new Date('2026-10-25T12:00:00Z'));
  for(const expected of ['diagnose understanding','RETEACH','actual attempts','learner authorship','AI-generated practice','untrusted user data','consumer mode','no authenticated school tenant','Do not invent memory','No web research']) assert.ok(prompt.includes(expected),expected);
  assert.ok(prompt.includes('13:00'));
  assert.ok(prompt.includes('fresh transfer question'));
  assert.ok(prompt.includes('card is the single check'));
  const research=buildInstructions(question,new Date('2026-10-25T12:00:00Z'),true);
  assert.ok(research.includes('NOT publication/update dates'));
  assert.ok(research.includes('Every factual claim and named organisation must match the actual cited source'));
  assert.ok(research.includes('Every factual paragraph, including the introduction and summary'));
  assert.ok(research.includes('Cite each list item and every sentence naming an authority at that sentence'));
  assert.ok(research.includes('Do not write an uncited factual preamble'));
  assert.ok(research.includes('cite its own official domain directly'));
});

test('changing information and citation requests route to real research while basic maths does not',()=>{
  for(const message of ['What are the latest WAEC registration dates?','Give official sources for this claim.','What is the exchange rate?','Find nearby pharmacies.']) assert.equal(needsSearch({...question,message}),true,message);
  for(const message of ['Explain linear equations.','Help me understand why 2x = 10 gives x = 5.','Create an AI-generated practice question about cells.']) assert.equal(needsSearch({...question,message}),false,message);
  assert.equal(needsSearch({...question,profile:{...question.profile,goal:'Latest 2026 admission requirements',area:'Lagos'}}),false,'Profile wording does not turn a maths question into web research.');
});

test('writing and editing use supplied dated facts without an irrelevant web lookup',()=>{
  for(const message of [
    'A customer says their parcel is late. Delivery is now expected tomorrow. Write a warm, concise WhatsApp reply without inventing a refund or promising an exact time.',
    'Edit the following text for clarity: "I will send the minutes today and meet you tomorrow."',
    'Write a short reply confirming our meeting today.',
    'Rewrite this forecast: "Tomorrow will be rainy. Bring an umbrella."',
  ]) assert.equal(needsSearch({...question,mode:'work',message}),false,message);
  assert.equal(needsSearch({...question,mode:'ask',message:'Edit my draft for clarity. It says our event is tomorrow.',notes:'Our event is tomorrow. Please arrive on time.'}),false);
});

test('work mode still researches explicitly requested verification or missing current facts',()=>{
  for(const message of [
    'Verify the current passport application requirements and write a customer note using official sources.',
    'Write a summary of the latest JAMB registration requirements.',
    'What are the current NIN registration fees?',
    'Write a description of tomorrow’s weather in Lagos.',
    'Edit this draft, then fact-check the current requirements with official sources.',
  ]) assert.equal(needsSearch({...question,mode:'work',message}),true,message);
  assert.equal(needsSearch({...question,mode:'research',message:'Write a short note about today.'}),true,'Explicit research mode retains its research contract.');
});

test('planning a supplied calendar does not search unless external information is needed',()=>{
  assert.equal(needsSearch({...question,mode:'plan',message:'Plan my day tomorrow around these meetings: 9 am budget review and 11 am customer call. I have two hours free in the afternoon.'}),false);
  for(const message of [
    'Plan my day tomorrow and check the weather in Lagos before an outdoor meeting.',
    'Plan my day tomorrow; find nearby pharmacies open now.',
    'Plan my visa application tasks and verify the current requirements using official sources.',
  ]) assert.equal(needsSearch({...question,mode:'plan',message}),true,message);
});

test('adding current facts takes precedence over transforming supplied notes',()=>{
  const notes='This report describes the application process and contains the draft to revise.';
  for(const message of [
    'Edit this draft and add the latest passport application fees in Nigeria.',
    'Edit this report and include the current admission requirements.',
  ]) assert.equal(needsSearch({...question,mode:'work',message,notes}),true,message);
  assert.equal(needsSearch({...question,mode:'work',message:'Summarise this report on current admission requirements.',notes}),false,'Transforming a supplied report does not itself request a new lookup.');
  for(const message of [
    'Edit this draft for grammar: "Please add the latest passport application fees in Nigeria."',
    "Edit this draft for grammar: 'Please add the latest passport application fees in Nigeria.'",
    'Edit this text for grammar: “Verify the current fees using official sources.”',
  ]) assert.equal(needsSearch({...question,mode:'work',message,notes}),false,'Quoted content is material to edit, not an external lookup instruction.');
});

test('research starters ask for the missing subject without claiming to have searched',()=>{
  const starters=[
    'Help me verify a claim. Ask me the claim and where I saw it. Distinguish evidence, inference and anything unknown.',
    'Help me research an official application process in Nigeria. Ask which process, then use official sources and flag changing requirements.',
    'Help me research a decision. Ask the question, my constraints and what would count as reliable evidence.',
  ];
  for(const message of starters){
    const result=localResponse({...question,mode:'research',message});
    assert.equal(result.strategy,'CLARIFY');
    assert.equal(result.meta.searched,false);
    assert.equal(result.meta.grounding,'clarification');
    assert.equal(result.meta.searchCalls,0);
    assert.deepEqual(result.sources,[]);
  }
});

test('only genuinely missing research subjects use the local clarification shortcut',()=>{
  assert.ok(researchClarification({...question,mode:'research',message:'Please help me research.'}));
  for(const payload of [
    {...question,mode:'research',message:'Research current Nigerian passport renewal requirements.'},
    {...question,mode:'research',message:'Check a claim: the passport fee changed this year.'},
    {...question,mode:'research',message:'Check my claim',notes:'The claim to investigate is quoted here.'},
    {...question,mode:'research',message:'Research',history:[{role:'user',content:'I need to compare admission requirements at two universities.'}]},
    {...question,mode:'ask',message:'Research'},
  ]) assert.equal(researchClarification(payload),null);
});

test('practice accepts one usable correct answer and rejects malformed evidence',()=>{
  const indexSchema=RESPONSE_SCHEMA.properties.practice.anyOf[1].properties.correctIndex;
  assert.equal(indexSchema.minimum,0);
  assert.equal(indexSchema.maximum,3);
  assert.match(indexSchema.description,/Zero-based options index/);
  const practice={topic:'Algebra',question:'Solve x + 2 = 5.',options:['2','3','7'],correctIndex:1,explanation:'Subtract 2 from both sides.'};
  const result=validatePractice(practice);
  assert.ok(result.id);
  assert.equal(result.correctIndex,1);
  for(const invalid of [{...practice,correctIndex:9},{...practice,options:['3','3']},{...practice,explanation:''},{...practice,options:['only one']},{...practice,correctIndex:'1'}]) assert.equal(validatePractice(invalid),null);
});

test('exact local tools calculate without inventing maps or dates',()=>{
  const clock=new Date('2026-10-25T23:30:00Z');
  const time=localResponse({...question,message:'What is the time in Lagos?'},clock);
  assert.match(time.answer,/12:30:00/);
  assert.match(time.answer,/UTC\+1/);
  assert.equal(time.meta.model,'local-tools');
  assert.equal(time.meta.modelCalls,0);
  assert.equal(time.meta.inputTokens,0);
  assert.equal(time.meta.outputTokens,0);
  assert.match(localResponse({...question,message:'18% of 15000'},clock).answer,/2,700/);
  assert.equal(localResponse({...question,message:'What is the WAEC exam date in Lagos?'},clock),null);
  assert.equal(localResponse({...question,message:'How long will it take to drive to Ikeja?'},clock).meta.grounding,'handoff');
});

test('live route and traffic questions hand off without web-derived time estimates',()=>{
  for(const message of ['How long will it take to drive from Ikeja to Lekki right now?','What is the traffic in Lagos today?','Give me the fastest route from Yaba to the airport.']){
    assert.equal(liveTravelRequest(message),true);
    assert.equal(needsSearch({...question,mode:'research',message}),false);
    const result=localResponse({...question,mode:'research',message});
    assert.equal(result.meta.grounding,'handoff');
    assert.equal(result.meta.searched,false);
    assert.equal(result.meta.modelCalls,0);
    assert.equal(result.sources[0].url,'https://www.google.com/maps/dir/?api=1');
    assert.match(result.answer,/cannot verify/);
    assert.doesNotMatch(result.answer,/\b\d+\s*(?:minutes?|hours?|km)\b/i);
  }
  assert.equal(liveTravelRequest('Explain website traffic.'),false);
  assert.equal(liveTravelRequest('How long does cell division take?'),false);
});

test('sources reject executable URLs and credentials',()=>{
  assert.equal(safeSourceUrl('javascript:alert(1)'),null);
  assert.equal(safeSourceUrl('https://user:password@example.com'),null);
  assert.equal(safeSourceUrl('http://127.0.0.1/private'),null);
  assert.equal(safeSourceUrl('https://www.jamb.gov.ng/'),'https://www.jamb.gov.ng/');
});

test('Nigerian authority claims must match their cited official domains',()=>{
  const sources=[{url:'https://www.cbn.gov.ng/notices/',title:'Central bank'},{url:'https://sec.gov.ng/notices/',title:'Securities regulator'}];
  assert.doesNotThrow(()=>assertResearchGrounding('The CBN publishes this notice [1]. The SEC publishes a different notice [2].',sources));
  assert.doesNotThrow(()=>assertResearchGrounding('The CBN and SEC publish notices [1] [2].',sources));
  assert.throws(()=>assertResearchGrounding('The CBN warns investors about this scheme [2].',sources),error=>error.code==='GROUNDING_UNAVAILABLE');
  assert.throws(()=>assertResearchGrounding('The CBN says this. [2]',sources),error=>error.code==='GROUNDING_UNAVAILABLE');
  assert.throws(()=>assertResearchGrounding('The SEC says this [1].',sources),error=>error.code==='GROUNDING_UNAVAILABLE');
  assert.throws(()=>assertResearchGrounding('The CBN says this [1].',[{url:'https://cbn.gov.ng.attacker.example/',title:'Not CBN'}]),error=>error.code==='GROUNDING_UNAVAILABLE');
  assert.doesNotThrow(()=>assertResearchGrounding('A listing gives opening hours [1].',[{url:'https://example.com/listing',title:'Listing'}]));
});

test('crawl recency is withheld rather than promoted to verified freshness',()=>{
  const sources=[{url:'https://example.com/listing',title:'Listing'}];
  for(const answer of ['This page was crawled yesterday [1].','The listing was indexed 2 days ago [1].','This is the freshest verification available [1].']) assert.throws(()=>assertResearchGrounding(answer,sources),error=>error.code==='GROUNDING_UNAVAILABLE');
  assert.doesNotThrow(()=>assertResearchGrounding('The listing gives 24-hour opening hours. Contact the business to confirm before travelling [1].',sources));
});
