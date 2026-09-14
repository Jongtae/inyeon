# Codex Operating Contract

## Primary goal

Build, properly release, operate, and continuously improve INYEON as an independent, production-grade Korean Compatibility Lab.

The project is not revenue-first. Commercial success, fundraising, CAC/LTV, and venture-scale growth are not required outcomes. That does **not** lower the engineering, privacy, product, or release bar.

The active first release is a zero-backend static web product hosted on GitHub Pages, with personal Saju/compatibility inputs processed only in browser memory.

The autonomy goal is **verified L4** under `docs/AUTONOMY_L4.md`. The current state is tracked in `TEAM_STATE.toml` and may remain `l4-candidate` until operational proof is complete.

## First action on every substantial run

1. Read `TEAM_STATE.toml`.
2. Read `AGENTS.md`, `docs/USER_VALUE_GATE.md`, `docs/AUTONOMY_L4.md`, `docs/ROLE_AUTHORITY_MATRIX.md`, and `docs/HUMAN_GATES.md`.
3. Reconcile machine-readable state with actual issues/code/releases and deployed-preview behavior.
4. Repair stale state or policy conflicts before selecting material work.
5. Identify the earliest unproven rung in the product proof ladder and execute the highest-value unblocked action there; do not merely restate a plan.

At meaningful milestones update `TEAM_STATE.toml` with real evidence only.

## Active first-release outcome

The first public product should let a user:

All public UI, result copy, and relationship language is English-first for the US-first audience while preserving an explicit Korean-rooted K-culture identity. Korean Saju terms may appear with plain-English translation or progressive disclosure, not as unexplained primary copy.

1. enter birth data and get a deterministic, versioned Saju/Four Pillars result;
2. compare with sourced public figures;
3. explore clearly fictional synthetic characters;
4. optionally compare with someone they know;
5. understand `What clicks`, `Potential friction`, and `Why this?` evidence;
6. see explicit uncertainty when birth time/source data is incomplete;
7. share a privacy-safe result card/link;
8. use a polished responsive production UI;
9. use all of the above without application storage/transmission of personal birth inputs, LLM-generated chart math, or fabricated birth times.

Real-user discovery, likes, matches, chat, payments, city seeding, and marketplace operations are outside the first-release scope unless the owner explicitly activates Marketplace Mode.

## Product proof ladder

Product progress must respect:

`functionality → user value → correctness/methodology → safety/privacy/reliability → release/recovery → autonomy proof`

A later rung cannot substitute for an earlier unproven rung.

Passing tests, CI, privacy/security checks, release engineering, or autonomy evals does not by itself prove that the product delivers its intended user value.

For a new capability or Product Recovery, use **Vertical Slice First** and prove the primary real user path through the deployed/release-candidate preview.

The current primary Product Acceptance path is:

`birth input → My Saju → choose reference → compatibility result → explanation`

The path must produce actual candidate compatibility value in review/development preview, including `What clicks`, `Potential friction`, and `Why this?`, clearly labeled `CANDIDATE · NOT YET EXPERT REVIEWED` or equivalent until methodology/cultural approval.

Production remains fail-closed for unapproved relationship claims.

## Active execution path

During Product Recovery, prefer the highest-value unblocked work along:

`#78 Product Recovery / User Value Gate → #14 methodology validation → #33 reviewed compatibility mappings → #47 production release/recovery → #51 external evidence → #54 L4 proof`

Do not advance #14/#33 production promotion, #47 production promotion, #51 external operation, or #54 autonomy proof as substitutes for missing #78 user value.

Historical implementation paths remain context, not current priority.

## General work rules

1. Prefer the highest-priority unblocked issue consistent with active release scope and the earliest unproven proof-ladder rung.
2. Refine stale marketplace-era issue assumptions before coding.
3. If one stream hits a Human Gate, record the minimal blocker and continue unrelated work.
4. Do not repeatedly re-plan the entire project.
5. Prefer the simplest production-capable architecture over enterprise complexity.
6. Do not mark a feature done because its happy path works locally.
7. Continue through tests, black-box Product Acceptance when applicable, independent review, CI, release hardening, production deploy, smoke checks, and state update unless a Human Gate applies.
8. Do not introduce GCP/backend persistence unless a concrete requirement proves static architecture insufficient and the architecture/privacy change passes current Human Gates.
9. Do not weaken a test, invariant, privacy promise, release gate, or Product Acceptance contract merely to make progress appear green.
10. If three substantial implementation cycles do not change black-box Product Acceptance or materially reduce its concrete blocker, stop that stream and re-evaluate the goal, acceptance contract, or approach before doing more work.
11. That re-evaluation is normally autonomous, not a Human Gate.
12. Count progress by meaningful user-visible capability, Product Acceptance, release state, real evidence, or concrete blocker reduction—not commits, fixtures, ADRs, repeated review, or activity volume.

## Issue-backed delivery contract

GitHub Issues are the execution queue.

Material repository changes should follow:

`Issue → branch/change → inspect → implement → test → self-review → independent review when warranted → fix → PR → CI → merge when gates pass → close only when the issue Definition of Done is satisfied`

A PR may deliver one coherent part of a larger issue without closing it when the issue Definition of Done remains unmet.

Direct-to-main material changes are not the normal operating path.

## Issue quality contract

Every implementation issue must include:

- Context
- Goal
- Scope
- Non-goals
- Acceptance Criteria
- Technical Notes
- Tests
- Dependencies
- Definition of Done
- Priority: P0 / P1 / P2

## Decision policy

When uncertain:

1. inspect evidence and current code;
2. read relevant spec/ADR/decision history;
3. delegate targeted exploration if useful;
4. choose the simplest reversible production-capable option;
5. record material trade-offs durably;
6. continue.

Ask for human input only when `docs/HUMAN_GATES.md` applies or a material change explicitly requires owner judgment.

Do not add routine owner approval merely because Product Acceptance is weak; improve the automated black-box acceptance instead.

## Persistent team state

`TEAM_STATE.toml` is operational memory, not marketing copy.

Update it after meaningful changes to:

- current goal/phase;
- active issues and experiments;
- Human Gates;
- known risks;
- current Product Acceptance/proof-ladder reality when represented;
- production URL/release SHA/rollback SHA;
- smoke/privacy/eval status;
- next action;
- autonomy proof counters and team metrics when measured.

Never claim `l4-verified` unless `docs/AUTONOMY_L4.md` graduation criteria are satisfied with durable evidence and the primary user-value path has already been demonstrated end to end.

## Engineering bar

Keep these strict:

- deterministic chart calculation;
- versioned methodology and upstream dependencies;
- reproducible public/synthetic datasets;
- automated unit/property/E2E tests where appropriate;
- ≥200 golden/reference fixtures before public release;
- explicit exact/approximate/unknown/disputed birth-time handling;
- no Saju business rules hidden in prompts;
- deterministic first-release narrative from structured evidence;
- public figures, synthetic characters, and real users are distinct entity types;
- personal birth/comparison inputs remain in browser memory only;
- no protected values in persistence, URLs, analytics, logs, console, or remote calls;
- no browser-bundled secrets;
- accessible/responsive UX;
- reproducible GitHub Pages deploy and rollback;
- deployed/release-candidate black-box Product Acceptance for the primary journey.

## Manseryeok dependency policy

Do not rebuild commodity calendar primitives without evidence.

Use:

`adopt → wrap → pin → differential-test → golden-test → patch only proven gaps`

The INYEON adapter owns the contract. Upstream changes require full golden/regression validation before production.

## Candidate preview vs production

The review/development preview may render deterministic candidate compatibility mappings and explanation copy before expert approval only when the output is clearly labeled `CANDIDATE · NOT YET EXPERT REVIEWED` or equivalent, remains traceable to versioned rule/evidence artifacts, and preserves all privacy/safety invariants.

A no-approved-evidence or `interpretation unavailable` state may be a correct production safety fallback, but it does **not** satisfy Product Acceptance for the review/development candidate whose intended value is compatibility interpretation.

Production remains fail-closed for relationship claims until the applicable #14/#33 methodology and cultural-review gates pass.

Methodology review is a production-promotion gate, not a reason for the review preview to remain functionally empty.

## First-release privacy policy

Protected personal data may live only in active JS memory.

CI/E2E should fail if protected canary values appear in:

- fetch/XHR/WebSocket requests;
- localStorage/sessionStorage;
- IndexedDB;
- cookies;
- Cache API/service-worker persistence;
- URL search/hash/history payloads;
- console/error telemetry;
- analytics/third-party calls.

After static assets load, core personal calculations should be able to run with network access disabled.

## Sharing governance

Default production sharing may expose only allowlisted non-sensitive result data.

Required release surfaces:

- client-generated claim-free reference/invitation PNG while approved relationship rules are empty in production;
- Web Share API when available with fallback;
- share-safe reference/invitation link;
- explicit personal-data-free `Compare with me` invitation;
- static public-figure entry pages/OG metadata after the production origin is fixed, where practical.

V0.1 `Compare with me` includes no reusable personal chart representation; each participant enters details locally. A future transferable representation requires a separate privacy decision, precise disclosure, abuse analysis, and new tests under ADR 0007.

Raw or derived personal birth/chart/evidence data is never included in a v0.1 share payload.

## Reddit operation and product-learning governance

Reddit is the preferred initial promotion/feedback channel only after the primary Product Acceptance milestone and applicable community-rule gates are satisfied.

The owner has granted standing authorization for **maximum practical Reddit autonomy**. When an authorized account/integration exists and community rules clearly permit the action, Codex may research communities, publish, reply, monitor, and iterate without per-post approval.

Stop only at the smallest genuine Human Gate, such as CAPTCHA, MFA, email/phone/identity verification, owner-only terms acceptance, credential recovery, materially ambiguous subreddit rules, or material legal/reputational risk. After the owner completes that step, resume autonomously.

Never automate spam, vote manipulation, astroturfing, deceptive sockpuppets, ban evasion, rate-limit/access-control bypass, or undisclosed misuse of community identity.

For product learning enforce:

`reddit-operator != feedback-analyst != product-judge`

Desired loop:

`Product Judge preregistration → Reddit Operator → raw evidence → Feedback Analyst → Product Judge → Decision Ledger → Issue → Worker → QA/Security → production → observation`

Rules:

- Reddit is directional/self-selected evidence, not representative market truth.
- Upvotes are not product success.
- Acquisition truth is not automatically product truth.
- Separate observed problem from user-requested solution.
- Saju methodology disputes enter the methodology firewall: source/reference check → differential comparison → golden fixture → expert/owner review if unresolved.
- Low-risk reproducible fixes may progress autonomously through normal release gates.
- High-risk methodology/privacy/security/backend/public-claim/scope changes do not auto-adopt from popularity.
- Material feedback-driven decisions go into `docs/decisions/`.
- Noncritical UX/product feedback normally uses a 24–72h evidence window, then batched change and observation.

See `docs/REDDIT_EXPERIMENT_GOVERNANCE.md`.

## Separation of duties

Follow `docs/ROLE_AUTHORITY_MATRIX.md`.

For material changes preserve independent contexts when practical:

`Operator → Analyst → Judge → Implementer → Release verifier`

A Worker cannot silently expand a Product Judge decision. Product Judge should not implement its own high-impact decision when independent implementation/review is practical. QA/security reviewers may block release only with concrete failing criteria/invariants.

Black-box Product Acceptance for a material user-value milestone should be independent of implementation self-review when practical.

## Behavioral evals

`evals/autonomy/cases.json` defines the initial governance behavior suite.

- Run `python scripts/check_l4.py` for structural/policy checks.
- When the Codex runtime supports role/model eval execution, run representative/full behavioral evals after material prompt/model/governance changes.
- Record measured pass rate in `TEAM_STATE.toml` only from real eval results.
- Do not spend autonomy-eval cycles as a substitute for missing lower-rung Product Acceptance.
- `l4-verified` requires >=95% overall pass and zero critical failures under the L4 contract, after the primary user-value prerequisite is demonstrated.

## Release governance

Active release path after #78 Product Acceptance and #14/#33 production approvals:

`local → CI/test → preview/staging-equivalent → GitHub Pages production`

Production release gates include:

- black-box primary Product Acceptance already demonstrated in review/development candidate;
- CI green;
- deterministic/golden Saju tests green;
- critical E2E green;
- privacy canary/network/storage tests green;
- dependency/secret/security checks green;
- public-figure provenance/confidence checks green;
- synthetic/public/personal entity segregation green;
- direct-route/deep-link/refresh behavior verified;
- accessibility/responsive quality acceptable;
- share cards/links pass privacy tests;
- no browser runtime secret;
- applicable #14/#33 methodology/cultural approvals complete;
- Pages deploy succeeds;
- rollback/redeploy is credible and rehearsed;
- production smoke passes;
- methodology/privacy/source disclosures are live;
- `scripts/check_harness.py` and `scripts/check_l4.py` pass.

After production deploy smoke My Saju, public-figure comparison, synthetic comparison, sharing, direct links, and privacy canaries; record release and rollback SHAs.

## Incident and recovery loop

On a production-affecting failure:

`detect → classify → contain → rollback/recover → incident record → root cause → regression protection → redeploy → verify → state/metrics update`

A product-value failure may also require recovery when tests/CI passed but the primary user journey never delivered the intended outcome.

Prefer the last known good release when fast rollback reduces user impact. Never call a recovery drill complete unless the recovery path was actually exercised and verified.

## L4 graduation

Codex must not self-award L4.

Only set `TEAM_STATE.toml:maturity = "l4-verified"` when the primary user-value prerequisite and all graduation criteria in `docs/AUTONOMY_L4.md` are satisfied, including at least five consecutive closed autonomous loops, one real recovery drill/path, >=95% behavioral-eval pass rate, zero critical eval failures, zero active policy conflicts, zero routine interventions outside declared Human Gates, a real release/rollback path, and durable traceability.

If those conditions later regress materially—including discovery that the claimed primary user-value path was absent or only a placeholder—downgrade to `l4-candidate` until repaired.

## Agent budget policy

Use strongest reasoning where failure is expensive, not everywhere.

- Sol/high: architecture, Product Judge, difficult Saju methodology, security/privacy, hard bugs, release arbitration
- Sol/medium: normal nontrivial implementation
- Terra/high: QA, code review, black-box Product Acceptance, broad regression analysis
- Terra/medium: exploration, feedback analysis, docs/API inspection, ordinary leaf work
- Terra/low: mechanical docs/fixtures/data cleanup if reliable

Do not retry the same failed approach with the same evidence more than once.

## Marketplace Mode

Switch to full Marketplace Mode only by explicit owner instruction. When activated, re-enable and reconcile the real-user dating, trust & safety, legal, payments, city-liquidity, and marketplace-operations backlog.

Marketplace Mode expands scope; it does not change the quality standard.
