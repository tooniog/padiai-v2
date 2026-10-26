# PadiAI v17 implementation and verification

26 October 2026. Implementation is ready for a controlled pilot; public AI activation still requires hosting secrets and durable usage protection. The working production deployment has not been replaced.

## 1. Before and after

| Area | Before | Implemented |
|---|---|---|
| Intelligence | Keyword-selected prepared coach replies | Server-side OpenAI Responses integration, five useful task modes, bounded conversation context |
| Learning | One lesson and a two-question check per track | Level/style preferences, misconception correction, fresh practice, feedback and reteaching from actual attempts |
| Assessment | Basic fixed quiz score | Blind second AI check for generated answer keys; disputed/unverifiable questions withheld without a score |
| Research | No web connection | Real web search, clickable citations, source details, publication/attribution guards and visible uncertainty |
| Local help | Static Nigerian examples | Broad-area context, sourced local discovery, deterministic Lagos clock/percentage calculations, honest Maps handoff |
| Progress | One browser-stored score | Actual question attempts counted once, topic review signals, optional browser persistence; no invented mastery percentage |
| Privacy | No explicit assistant memory controls | Memory off by default, editable profile, export/delete, no server chat database, private-file build allowlist |
| Reliability | Broad GET caching and HTML fallback for failed assets | Public-only caches, versioned offline navigation, typed failures, bounded requests, stop/retry and safe errors |
| Distribution | Public static app | Personal experience with explicit Education OS governance boundary; no pretend school connection |

The original lessons, install icons, learning routes and manifest remain available. GitHub and the exact live v16 source were archived separately before changes.

## 2. Features improved

Ask, Learn, Work, Plan and Research share a focused mobile interface. Starter tasks cover everyday decisions, customer replies, writing, interview practice, revision and official-source research. Notes accept text only; no file/PDF-reading capability is claimed. Users can resume their recent conversation only when they opt into browser memory. Work stays session-only otherwise.

Original lessons tolerate unavailable storage and invalid saved tracks. Incomplete quizzes no longer record a result. Feedback explains responsible AI use instead of showing a score alone.

## 3. Intelligence improved

Everyday help and teaching default to `gpt-5.4-mini`; research defaults to `gpt-5.6-terra`. Practice answer checks use a separate blind context, with the question and options but without the proposed key. This avoids showing the checker the proposed answer; the remaining rate of correlated errors is unmeasured. All model routes are configurable.

The assistant distinguishes explaining, clarifying, testing, practice, review, reteaching and human-support escalation. It uses only supplied profile/history, preserves student authorship, and treats notes and web material as untrusted data. Learning progress comes from observed attempts; it is not a validated mastery graph or an institutional grade.

## 4. Safety and reliability improved

Requests have size/history limits, same-origin checks, safe error messages, a shared 45-second AI deadline and cancellation. Obvious credentials/security codes are rejected before transmission. This preflight is limited pattern detection, not a guarantee that all sensitive text is identified. No raw question/profile/provider-error text is logged by the application.

Immediate-risk language has a local supportive response that encourages appropriate human help without invented helpline numbers or false reports. This is a limited backstop alongside model instructions, not a validated safeguarding service.

Research must actually search and return usable citation annotations. Known Nigerian authority/domain mismatches and unsupported crawl-date freshness claims fail closed. These checks are conservative and incomplete: a correct domain does not prove that every claim is supported. Important answers still need source review.

Published business hours are not confirmed live opening status. Driving/traffic/ETA questions receive a clearly labelled Maps handoff rather than guessed times. Requests to gamble essential savings on guaranteed returns receive bounded general support instead of personalised investment recommendations.

The build publishes only 16 named frontend assets. Secrets, server source, tests, evaluations, backups and local launcher files are excluded from the public folder. The service worker does not cache API/private/cross-origin responses or turn failed asset requests into HTML. Only obsolete Padi caches are deleted.

Production AI deliberately remains unavailable without explicit enablement and durable Redis limits, or separately verified real edge protection. An owner/team preview can be explicitly attested only on a Vercel preview after Vercel Authentication protection is independently verified. That mode uses instance-local backstops and cannot enable a production deployment. Default durable budgets are 8 requests/minute/IP, 50/day/IP and 300/day globally. These are request limits, not currency guarantees; shared-IP behaviour needs pilot tuning.

## 5. Test results and observed costs

- **58 automated tests passed**, covering API validation, production fail-closed behaviour, protected-preview isolation, source guards, independent practice checks, cancellation/timeouts, incomplete provider-usage accounting, legacy lessons, packaging and offline cache behaviour.
- **24 mock browser checks passed**, covering mobile/desktop layout, all key memory/export/delete controls, practice evidence/deduplication, next-turn feedback, stop/retry, unavailable storage, safe rendering, inline citations, errors and request limits. No page errors were observed.
- **20 initial live synthetic cases completed**. Their format/evidence checks passed, but subsequent answer review found a wrong practice key, weak transfer practice and research attribution/freshness errors. A format pass was explicitly not treated as an answer-quality pass.
- **Nine affected regression cases completed** after practice/source improvements. A disputed question was correctly withheld; source review led to further research safeguards and model routing changes.
- Final opening-hours research completed with the stronger model and guarded source handling. A financial research response was withheld by the authority guard; the essential-savings guarantee case now receives a deterministic, bounded response with no model call. The rejected response record is retained as evidence.
- Real local browser-to-API-to-model tutoring was observed: the explanation solved `2x + 3 = 11` correctly and an unconfirmed question was withheld without increasing progress. A subsequent shapes session completed the whole loop: a wrong pentagon answer received a correction, the follow-up explanation used that actual attempt, and a new quadrilateral question was answered correctly. Progress showed two attempts and one correct answer, with a topic marked for review and no mastery claim. This is one synthetic functional scenario, not evidence of learner gains. Browser practice recording/adaptation is also covered by the mock suite.

The recorded evaluation batches show approximately **$0.173 in estimated text-token costs**, excluding search-tool fees, hosting, standalone smoke requests and one rejected research call whose usage was not captured by the earlier harness. This is not the session's total bill or a per-user cost forecast. The harness now retains safe usage metadata for source-guard rejections. Missing provider usage remains unknown; a full cost estimate is withheld when usage or model pricing is incomplete, with measured subtotals reported separately. Observed initial-batch median latency was about **1.65 seconds**, maximum **9.03 seconds**; the practice-check regression median was about **2.63 seconds**. These are small synthetic samples, not production service-level measurements.

Provider/source documentation: [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [GPT-5.6 Terra](https://developers.openai.com/api/docs/models/gpt-5.6-terra), [web search](https://developers.openai.com/api/docs/guides/tools-web-search). Review actual provider billing and current prices before setting commercial assumptions.

## 6. Known limitations

This is a pilot candidate, not evidence of nationwide readiness, educational gains or reliable high-stakes decision-making. Independent teacher/safeguarding review, representative Nigerian user testing and a pre/post/retention study remain necessary. Preview languages are unvalidated. AI explanations and two-pass practice can still be wrong. Conservative source guards can withhold useful answers and require calibration.

There is no authenticated institutional tenant, approved school knowledge, human notification pathway, cloud account, cross-device history, live traffic engine, booking/payment/message execution, voice or document upload pipeline. Government decision use, financial suitability assessment and data-sovereignty claims are not established.

Hosting secrets and durable usage protection are not yet configured. Public AI activation must not bypass those controls. The local dedicated key is present, private and excluded from Git; it has not been printed or added to frontend assets.

## 7. P2/P3 backlog

Validated curriculum retrieval; a reviewed question bank; stronger independent assessment verification; spaced review; properly processed file inputs; tested language/voice support; authenticated cross-device accounts; native places/routes integrations; outcome-based pricing tests. Transactions and broad autonomy require separate permission and failure-recovery design.

## 8. Institutional release requirement

Connect Padi to Runnerbot Education OS only through authenticated tenant context, approved resources, explicit access/retention rules and an actual designated-human safeguarding path. Cohort analytics should use minimal, appropriately governed evidence. Consumer conversations must not silently become school records.

## 9. Consumer pilot requirement

Use a bounded Lagos pilot across learners, workers and small-business owners. Measure successful tasks, correction rates, repeat successful use, time to useful result and learning transfer—not emotional dependence or screen time. The included rubric defines critical-failure gates and a pre/post/seven-day retention protocol. Do not claim those outcomes until measured.
