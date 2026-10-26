# PadiAI v17

Padi is a Nigerian daily-help and learning companion. The shared personal experience supports Ask, Learn, Work, Plan and Research. It remains learner/user-facing; Runnerbot Education OS owns institutional governance. This build does not claim an authenticated school integration.

The existing static app, lessons, icons and install manifest have been preserved and upgraded. Node functions now handle AI requests; only an explicit allowlist of frontend files enters the public build.

## Run and verify

Use Node 22 or newer. This project has no third-party runtime dependencies.

```sh
npm run dev
```

The local server binds to `127.0.0.1:8787`, loads ignored `.env.local` configuration, and serves only the public build. It never serves the repository or private files directly. The dedicated `OPENAI_API_KEY` remains server-side. Start with the existing confirmed local configuration; do not paste secrets into messages or source code.

```sh
npm test
```

Run the offline browser suites with `node tests/ui-flows.mjs` and `node tests/ui-resilience.mjs`. They use mocked AI responses, an allowlisted local server and an installed Chrome/Playwright runtime. Override `PADI_CHROME_PATH` and `PADI_PLAYWRIGHT_MODULE` for another setup.

The bounded live evaluation command is `npm run eval:live`. It uses synthetic cases and incurs API/tool usage. Select a case with `-- --case=<id>` or a smaller batch with `-- --limit=5`. It reports functional checks separately from answer-quality review. Read `evaluations/RUBRIC.md` before interpreting results; a passing schema is not proof of correct teaching.

## Production configuration

- `OPENAI_API_KEY`: private provider credential. Never set it as a public/client variable or commit it.
- `OPENAI_MODEL`, `OPENAI_RESEARCH_MODEL`: optional; defaults are `gpt-5.4-mini` for everyday help/learning and `gpt-5.6-terra` for research. Practice uses a separate blind check; `OPENAI_VERIFICATION_MODEL` optionally selects its model.
- `PADI_AI_ENABLED=true`: explicitly enables configured AI in production.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`: durable usage protection. If absent, production remains unavailable unless a real edge limit was separately installed and verified and `PADI_EDGE_RATE_LIMITED=true` records that fact. Never set the edge flag as a workaround.
- `PADI_REQUESTS_PER_MINUTE`, `PADI_REQUESTS_PER_DAY`, `PADI_GLOBAL_DAILY_REQUESTS`: bounded request budgets. Defaults: 8/minute/IP, 50/day/IP, 300/day globally. Redis counters expire within 48 hours. These are request ceilings, not exact currency budgets. Shared-network IP limits need pilot tuning.
- `PADI_ALLOWED_ORIGINS`: optional explicit origins; default browser requests must match the serving host.
- `PADI_PROTECTED_PREVIEW=true`: an operator attestation permitted only when Vercel sets `VERCEL=1` and `VERCEL_ENV=preview`. Set it only after verifying Vercel Authentication protects the deployment. It permits an authenticated owner/team preview using instance-local backstops; it is not a public or global usage guarantee. The same flag is ignored in production.

Set secrets through trusted hosting settings. A local key does not automatically configure Vercel. Deployment safety checks deliberately fail closed; do not expose a paid public endpoint while its protections are missing.

`npm run build` copies 16 public assets into `public/`. Vercel serves that folder plus its separately compiled `api/` functions. Never change the output directory to the repository root. `.vercelignore` excludes credentials, tests, evaluations, machine launchers and historical backups.

## Privacy, sources and limits

Memory is off by default and optional on the browser. There is no server-side chat database or cross-device account. Notes are sent only with active requests and are not separately saved by the browser; an answer can repeat their contents. Export and deletion controls cover assistant data and deletion also clears legacy library settings. Provider processing and infrastructure logs follow the providers' policies; browser deletion does not erase provider records.

Research is an explicit web-search tool with clickable sources and visible uncertainty. Citation presence alone does not establish a claim's correctness. Current local listings are not confirmed opening status. Live navigation, traffic/ETA, bookings, payments, messages and institutional escalations are not implemented. Maps links are handoffs, not route calculations.

Practice questions are AI-generated learning aids, not official examinations, trusted grades or precise mastery estimates. A separate blind AI pass must agree with the answer key before a generated question is displayed; disagreements or unavailable validation withhold it without a score. Two AI passes can still share an error. Progress counts actual attempts once. Learning improvement, language quality and institutional suitability require further representative learner/teacher testing. See the release report for observed results and known limits.
