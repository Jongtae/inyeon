# Codex Operating Contract

## Primary goal

Build, properly release, operate, and continuously improve INYEON as an independent, production-grade Korean Compatibility Lab.

The project is not revenue-first. Commercial success, fundraising, CAC/LTV, and venture-scale growth are not required outcomes. That does **not** lower the engineering, privacy, product, or release bar.

The active first release is a zero-backend static web product hosted on GitHub Pages, with personal Saju/compatibility inputs processed only in browser memory.

The autonomy goal is **verified L4** under `docs/AUTONOMY_L4.md`. The current state is tracked in `TEAM_STATE.toml` and may remain `l4-candidate` until operational proof is complete.

## First action on every substantial run

1. Read `TEAM_STATE.toml`.
2. Read `AGENTS.md`, `docs/AUTONOMY_L4.md`, `docs/ROLE_AUTHORITY_MATRIX.md`, and `docs/HUMAN_GATES.md`.
3. Reconcile machine-readable state with actual issues/code/releases.
4. Repair stale state or policy conflicts before selecting material work.
5. Execute the highest-value unblocked action; do not merely restate a plan.

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

## Active execution path

Prefer the highest-value unblocked work along:

`#1 → #8 → #9-14 → #6 → #33-34 → #50/#49 → #35 deterministic explanation + #53 static web UI → #43 → #52 → #47 → #51`

Historical marketplace P0 labels do not outrank this path.

## General work rules

1. Prefer the highest-priority unblocked issue consistent with active release scope.
2. Refine stale marketplace-era issue assumptions before coding.
3. If one stream hits a Human Gate, record the minimal blocker and continue unrelated work.
4. Do not repeatedly re-plan the entire project.
5. Prefer the simplest production-capable architecture over enterprise complexity.
6. Do not mark a feature done because its happy path works locally.
7. Continue through tests, independent review, CI, release hardening, production deploy, smoke checks, and state update unless a Human Gate applies.
8. Do not introduce GCP/backend persistence unless a concrete requirement proves static architecture insufficient and the architecture/privacy change passes current Human Gates.
9. Do not weaken a test, invariant, privacy promise, or release gate merely to make progress appear green.

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

## Persistent team state

`TEAM_STATE.toml` is operational memory, not marketing copy.

Update it after meaningful changes to:

- current goal/phase;
- active issues and experiments;
- Human Gates;
- known risks;
- production URL/release SHA/rollback SHA;
- smoke/privacy/eval status;
- next action;
- autonomy proof counters and team metrics when measured.

Never claim `l4-verified` unless `docs/AUTONOMY_L4.md` graduation criteria are satisfied with durable evidence.

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
- reproducible GitHub Pages deploy and rollback.

## Manseryeok dependency policy

Do not rebuild commodity calendar primitives without evidence.

Use:

`adopt → wrap → pin → differential-test → golden-test → patch only proven gaps`

The INYEON adapter owns the contract. Upstream changes require full golden/regression validation before production.

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

Default sharing may expose only allowlisted non-sensitive result data.

Required release surfaces:

- client-generated PNG/WebP card;
- Web Share API when available with fallback;
- share-safe result link;
- explicit `Compare with me` flow if implemented;
- static public-figure entry pages/OG metadata where practical.

If `Compare with me` includes any derived personal chart representation, show exactly what will be shared and require deliberate confirmation.

Raw birth date/time/place is never silently included.

## Reddit operation and product-learning governance

Reddit is the preferred initial promotion/feedback channel after a production candidate exists.

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

## Behavioral evals

`evals/autonomy/cases.json` defines the initial governance behavior suite.

- Run `python scripts/check_l4.py` for structural/policy checks.
- When the Codex runtime supports role/model eval execution, run representative/full behavioral evals after material prompt/model/governance changes.
- Record measured pass rate in `TEAM_STATE.toml` only from real eval results.
- `l4-verified` requires >=95% overall pass and zero critical failures under the L4 contract.

## Release governance

Active path:

`local → CI/test → preview/staging-equivalent → GitHub Pages production`

Production release gates include:

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
- Pages deploy succeeds;
- rollback/redeploy is credible and rehearsed;
- production smoke passes;
- methodology/privacy/source disclosures are live;
- `scripts/check_harness.py` and `scripts/check_l4.py` pass.

After production deploy smoke My Saju, public-figure comparison, synthetic comparison, sharing, direct links, and privacy canaries; record release and rollback SHAs.

## Incident and recovery loop

On a production-affecting failure:

`detect → classify → contain → rollback/recover → incident record → root cause → regression protection → redeploy → verify → state/metrics update`

Prefer the last known good release when fast rollback reduces user impact. Never call a recovery drill complete unless the recovery path was actually exercised and verified.

## L4 graduation

Codex must not self-award L4.

Only set `TEAM_STATE.toml:maturity = "l4-verified"` when all graduation criteria in `docs/AUTONOMY_L4.md` are satisfied, including at least five consecutive closed autonomous loops, one real recovery drill/path, >=95% behavioral-eval pass rate, zero critical eval failures, zero active policy conflicts, zero routine interventions outside declared Human Gates, a real release/rollback path, and durable traceability.

If those conditions later regress materially, downgrade to `l4-candidate` until repaired.

## Agent budget policy

Use strongest reasoning where failure is expensive, not everywhere.

- Sol/high: architecture, Product Judge, difficult Saju methodology, security/privacy, hard bugs, release arbitration
- Sol/medium: normal nontrivial implementation
- Terra/high: QA, code review, broad regression analysis
- Terra/medium: exploration, feedback analysis, docs/API inspection, ordinary leaf work
- Terra/low: mechanical docs/fixtures/data cleanup if reliable

Do not retry the same failed approach with the same evidence more than once.

## Marketplace Mode

Switch to full Marketplace Mode only by explicit owner instruction. When activated, re-enable and reconcile the real-user dating, trust & safety, legal, payments, city-liquidity, and marketplace-operations backlog.

Marketplace Mode expands scope; it does not change the quality standard.
