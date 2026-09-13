# INYEON Operations Plan

Status: operating baseline for alpha → city beta → production.

## 1. Operating principle

INYEON is a dating marketplace and a trust-and-safety operation before it is an astrology content product.

Operational priority order:

1. safety;
2. reliability;
3. successful reciprocal conversations;
4. user retention;
5. conversion/revenue;
6. cost efficiency.

Never optimize engagement at the expense of safety, consent, privacy, or marketplace quality.

## 2. Launch stages

### M0 — governance / proof of architecture

Exit criteria:

- durable specs and ADR process;
- validated Codex harness;
- repo/CI skeleton;
- product domain model;
- Saju methodology v1 draft;
- privacy map + threat model;
- dependency-aware backlog.

### M1 — local vertical slice

- account/profile/birth input;
- deterministic chart;
- discovery;
- like/match;
- basic Gung-hap explanation;
- block/report/unmatch;
- local critical E2E.

### M2 — staging

- reproducible staging;
- managed DB/storage/auth;
- chat;
- moderation console/workflow;
- observability;
- export/delete;
- CI/CD and migration process;
- smoke tests.

### M3 — private alpha

- verified invite-only users;
- safety ops coverage;
- Inyeon Match;
- event taxonomy + KPI dashboard;
- structured qualitative feedback;
- no public marketplace expansion until liquidity and moderation are demonstrated.

### M4 — production-ready city beta

- production infrastructure;
- backup/restore verified;
- identity/photo verification approach;
- full Gung-hap;
- post-date feedback;
- DSAR/privacy tooling;
- penetration/threat-model findings resolved or explicitly gated;
- qualified legal/policy review.

### M5 — production city launch

- DNS/TLS/runtime healthy;
- production migrations complete;
- signup/discovery/match/chat/report/delete smoke-tested;
- error tracking + alerts live;
- support/moderation SLA staffed;
- rollback plan verified.

### M6 — operate / learn / expand

`OBSERVE → TRIAGE → ACT → VERIFY → LEARN`

Second city only after first-city liquidity and safety goals are met.

## 3. Pilot-city strategy

Default research recommendation: test Los Angeles first versus New York City.

Choose the city where the company can seed approximately **2,000 genuinely eligible, balanced, verified profiles** before broad opening.

Do not open LA + NYC simultaneously unless acquisition budget and supply density are both clearly sufficient. Two thin marketplaces are worse than one liquid one.

Readiness scorecard should include:

- seedable verified profiles by orientation/intent/age cohort;
- eligible candidates per expected active user;
- creator/community partner density;
- Korean cultural venue/event partner access;
- projected CAC by channel;
- moderation/support time-zone coverage;
- local legal/operational issues;
- ability to run IRL pilots safely.

## 4. Marketplace health gates

Monitor by metro and by meaningful matching cohort, not only aggregate MAU.

Minimum operational views:

- verified active supply;
- eligible candidates per active user;
- impression concentration / repeated exposure;
- like rate;
- mutual-match rate;
- match → reciprocal conversation;
- 6-message conversation rate;
- reported-date rate when available;
- block/report/unmatch rates;
- median time to first meaningful candidate;
- orientation/intent cohort liquidity;
- verification completion.

If a cohort has poor liquidity, reduce acquisition into that cohort or increase compatible supply rather than hiding the imbalance behind ranking.

## 5. Trust & Safety operating model

### Minimum user controls

- 18+ gate;
- block;
- report;
- unmatch;
- account deletion;
- safety center;
- verification state where enabled;
- precise-location protection;
- anti-harassment rate limits.

### Report categories

At minimum:

- harassment / abusive language;
- hate / identity attack;
- sexual misconduct / non-consensual sexual content;
- scam / fraud / solicitation;
- impersonation / catfishing;
- underage suspicion;
- threats / stalking / doxxing;
- non-consensual image distribution;
- spam;
- safety concern after in-person meeting;
- other.

### Severity model

**S0 / critical** — credible imminent physical threat, underage sexual-risk indicators, serious stalking/doxxing, credible self-harm/violence escalation. Immediate human escalation and account containment.

**S1 / high** — scam network, repeated harassment, sexual coercion, credible impersonation, explicit threat without immediate imminence. Fast human review.

**S2 / medium** — abusive behavior, persistent unsolicited sexual content, lower-confidence fraud/impersonation. Queue with defined SLA.

**S3 / low** — spam, low-severity profile policy issues, duplicate account. Standard queue.

### Initial SLA targets

Planning targets, to be validated with staffing:

- S0: immediate automated containment where appropriate + human review target < 15 minutes during covered launch hours;
- S1: human review target < 1 hour;
- S2: < 12 hours;
- S3: < 24 hours.

Do not publish an SLA that operations cannot staff.

### Mandatory auditability

Every moderation action should record:

- case ID;
- reporter/subject pseudonymous IDs;
- category/severity;
- evidence references;
- automated signals;
- reviewer ID/role;
- action/reason code;
- timestamps;
- appeal/escalation state.

## 6. Verification operations

Prefer a specialized third-party liveness/photo verification provider rather than building biometric templates internally.

Vendor evaluation must cover:

- data retention;
- biometric template handling;
- US state coverage;
- false-reject/false-accept rates;
- demographic performance disclosures;
- deletion/export support;
- incident notification terms;
- cost per verification;
- SDK quality and fallback flows.

Never market verification as proof that a user is safe. It only verifies a defined identity/photo/liveness claim.

## 7. Support / moderation team plan

### Initial 1–5 person operating team

- founder/GM/product owner;
- technical lead;
- product/design owner;
- fractional privacy/product counsel;
- fractional trust & safety advisor;
- part-time Korean Saju advisors.

Engineering can be partly Codex-accelerated, but user safety cases must have accountable humans.

### Before city beta

Add/assign:

- Trust & Safety lead;
- moderation operators;
- customer operations/support;
- growth/community lead;
- analytics owner;
- QA/release owner.

### At scale

Add dedicated security/privacy, SRE/platform, data science/recommendations, partnerships/events, and expanded moderation coverage.

## 8. Weekly operating rhythm

### Daily

- incident/safety review;
- uptime/error/latency check;
- moderation queue aging;
- fraud/scam pattern review;
- critical funnel regression alert review.

### Weekly

**Monday — Marketplace & Safety**
- metro/cohort liquidity;
- reports/blocks/scams;
- moderation SLA;
- supply imbalance actions.

**Tuesday — Product Quality**
- onboarding activation;
- discovery → match → conversation;
- Inyeon performance;
- qualitative feedback.

**Wednesday — Engineering / Reliability**
- production defects;
- SLO/error budget;
- dependency/security patches;
- backup/restore or runbook follow-ups.

**Thursday — Growth / Community**
- creator/community pipeline;
- event readiness;
- CAC and referral performance;
- marketplace supply plan.

**Friday — Experiment / Decision Review**
- experiments and guardrails;
- fairness cuts;
- pricing/retention;
- next week's top three company risks.

## 9. Incident response

Incident classes:

1. safety / user harm;
2. privacy/data exposure;
3. auth/account takeover;
4. availability/reliability;
5. financial/subscription issue;
6. Saju calculation or narrative correctness defect;
7. moderation/verification vendor outage.

For any material incident:

`detect → contain → preserve evidence → assign incident commander → user-protection action → internal/legal/vendor escalation → recover → verify → communicate as required → postmortem → preventive issue`

No incident should be closed without a concrete prevention/follow-up owner.

## 10. Reliability targets

Exact SLOs should be set after baseline measurement. Initial planning targets:

- API availability: 99.9% for city beta;
- crash-free mobile sessions: >99.5%;
- discovery API P95: <500 ms excluding media fetch;
- message send acknowledgement P95: <1 s under pilot load;
- critical background job backlog: no unbounded growth;
- account deletion/export jobs: measurable completion SLA;
- monitoring coverage for auth, chart compute, discovery, match, chat, reports, payments.

## 11. Release governance

Environments:

`local → test → staging → production`

Required production gate:

- CI green;
- migration validated;
- critical E2E green;
- security/privacy checks green;
- observability present;
- rollback documented;
- backup/restore current;
- privacy/safety checklist complete;
- staging smoke test successful;
- release notes generated.

Post-deploy:

- run production smoke;
- verify error rate/latency;
- verify signup → discovery → match/chat path;
- verify report/block/delete paths;
- record release SHA/config versions;
- monitor rollback signals for defined window.

## 12. Privacy operations

Operational requirements:

- subject access/export workflow;
- account deletion workflow with downstream cascade tracking;
- category-specific retention schedule;
- processor/vendor inventory;
- consent/policy version tracking;
- admin access audit;
- incident notification decision process;
- quarterly access review;
- no production PII copied into support tickets or engineering fixtures.

## 13. Financial operating scenarios

These are planning estimates, not vendor quotes.

### Lean 12-month path

Approximate total: **$450k–$900k**.

Use:

- one city;
- one mobile codebase;
- managed services;
- hand-curated compatibility rules;
- modest verification/moderation footprint;
- no advanced ML until measurement infrastructure exists.

A controlled alpha may be possible in roughly **$120k–$250k** depending on founder labor and staffing.

### Properly staffed first-year plan

Approximate total: **$1.5M–$3.3M**.

Planning ranges:

- product/engineering/design: $850k–$1.5M;
- trust & safety/moderation: $180k–$390k;
- legal/privacy/insurance: $90k–$220k;
- Saju experts/cultural research: $45k–$100k;
- cloud/LLM/vendor tooling: $60k–$180k;
- verification: $45k–$135k;
- research/community: $75k–$180k;
- launch/growth/events: $300k–$760k.

Do not cut legal/privacy architecture, authentication, moderation, or core safety to extend runway.

## 14. Human gates

Codex/engineering should stop for human approval when work requires:

- accepting external legal terms;
- committing material recurring spend beyond budget policy;
- production destructive data operations;
- final legal claims or compliance assertions;
- App Store/Play contractual acceptance;
- human moderation judgment in serious cases;
- public incident communications;
- launch decision when safety/liquidity criteria are borderline.

Everything else should continue autonomously when reversible and within the repo governance.

## 15. Go / no-go launch checklist

City beta is **No-Go** if any of the following is true:

- no staffed moderation process;
- block/report is unreliable;
- account deletion is incomplete;
- Saju engine correctness is not validated on golden fixtures;
- compatibility can override safety/eligibility;
- precise location can leak;
- verification or moderation vendor terms are unresolved;
- privacy/legal review has critical open issues;
- marketplace density is too low for core cohorts;
- rollback/backup/incident response is not operational.

Launch is a controlled operational decision, not a marketing date.
