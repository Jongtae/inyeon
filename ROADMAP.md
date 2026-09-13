# Roadmap and Milestone Gates

GitHub Issues are the execution source of truth. `BACKLOG.md` groups the current 48-issue backlog by epic and critical path; this file defines milestone outcomes and gates rather than duplicating every task.

## Execution principle

Work in dependency order, not issue-number order.

Prefer parallel work only when agents will not edit the same shared schemas/modules. Safety/privacy/architecture review should happen before a risky boundary becomes expensive to change.

Primary critical-path shape:

```text
M0 governance + architecture
  ↓
domain contracts / privacy boundaries / Saju methodology
  ↓
deterministic Saju engine + baseline dating core
  ↓
compatibility rule engine + local mobile vertical slice
  ↓
staging + messaging + moderation + analytics + deletion
  ↓
private alpha / Inyeon Match / controlled experiments
  ↓
verification + full Gung-hap + legal/security + production readiness
  ↓
one-city launch
  ↓
operate, measure, expand only when gates pass
```

## M0 — Governance and proof of architecture

Primary issues: #1–#8, #16, plus architecture/privacy preparation.

Exit:

- durable product/business/architecture/operations/analytics specs;
- validated Codex harness and subagent routing;
- repo/toolchain/CI skeleton;
- ADRs for runtime, persistence, auth, Saju methodology, messaging, analytics/privacy, LLM boundary, and environments;
- canonical product principles/non-goals;
- Saju advisory process and `korean-saju-v1` profile;
- inclusive compatibility taxonomy + prohibited-claims matrix;
- domain model/API contracts with privacy/retention/authorization classes;
- launch-market scorecard and concept-research plan;
- dependency-aware GitHub backlog with no circular critical-path dependency.

**Gate:** do not let application implementation silently decide disputed Saju conventions, privacy boundaries, or compatibility semantics.

## M1 — Local vertical slice

Primary issues: #9–#14, #17–#22, #26–#27, #31, #33.

Exit:

- account/auth/18+ lifecycle;
- dating profile + mutual preferences;
- sensitive BirthInput vault;
- historical timezone/birth-location normalization;
- solar-term calculation;
- deterministic year/month/day/hour pillars with exact/approximate/unknown birth-time behavior;
- derived features required by compatibility v1;
- golden chart regression corpus underway and CI-connected;
- immutable chart snapshot API;
- baseline eligibility/candidate retrieval/ranking with Saju weight = 0;
- Like/Pass/mutual Match state machine;
- deterministic compatibility-rule DSL/evidence generator;
- mobile onboarding → discovery → Like/Match vertical slice;
- report/block/unmatch available in the local slice;
- critical local E2E green.

**Gate:** no Saju ranking experiment until the non-Saju baseline, rule provenance, unknown-time model, and safety exclusions are testable independently.

## M2 — Staging and operational core

Primary issues: #23–#24, #30, #32, #34, #37–#38, #41, #47.

Exit:

- reproducible staging via infrastructure-as-code;
- managed DB/storage/auth and secure secret strategy;
- realtime chat + mobile match inbox/chat;
- moderation case pipeline and admin console;
- compatibility confidence/uncertainty model;
- localization/content-key framework;
- privacy data map and Privacy Center foundation;
- account export/deletion cascade;
- privacy-safe analytics event pipeline + data-quality checks;
- logs/metrics/traces/error tracking and alert baseline;
- CI/CD, migration workflow, staging smoke tests;
- backup strategy and non-production restore drill.

**Gate:** no invite-only alpha with unstaffed moderation, unreliable block/report, untested deletion, or raw sensitive fields leaking into logs/analytics.

## M3 — Private alpha

Primary issues: #28, #36, #38, #41, #43–#44.

Exit:

- verified invited users in one selected metro/cohort;
- staffed safety operations coverage;
- limited Inyeon Match;
- privacy-safe referral/invite attribution;
- event taxonomy and KPI dashboards operating on real alpha traffic;
- A/B/C experiment infrastructure capable of preserving a true non-Saju baseline;
- controlled user feedback/research loop;
- cohort-level marketplace liquidity dashboard;
- staged invite waves with hold/rollback criteria.

**Gate:** do not scale acquisition if reciprocal-conversation quality, retention, safety, or cohort liquidity is weak even when signups/Like rates look strong.

## M4 — Production-ready city beta

Primary issues: #15, #25, #29, #35–#40, #42, #46–#48.

Exit:

- production infrastructure + tested backup/restore;
- photo/liveness verification approach approved and integrated or explicitly deferred by launch decision;
- full Gung-hap deep dive with methodology/limitations page;
- structured LLM narrative service with PII stripping, rule validation, prohibited-claims filtering, and fallback;
- post-date feedback and opt-in Couple Mode;
- subscription/entitlement infrastructure if monetization is enabled;
- full privacy/threat-model review;
- external penetration-test package and critical finding closure;
- US legal/app-store/UGC/subscription readiness package;
- qualified human legal/policy/vendor approvals recorded as Human Gates;
- production smoke/rollback/incident runbooks ready.

**Gate:** city beta is No-Go with open critical security/privacy/safety/legal blockers or unresolved Saju calculation correctness.

## M5 — Production city launch

Primary issue: #44 plus production portions of #46–#47 and launch checklists.

Exit:

- one pilot metro selected through scorecard;
- approximately 2,000 genuinely eligible, balanced, verified seed profiles or a data-backed revised liquidity threshold;
- DNS/TLS/production runtime healthy;
- production migrations complete;
- signup → chart → discovery → match → chat → report/block → export/delete smoke-tested;
- alerts/error tracking/SLO ownership live;
- support/moderation staffing and severity SLAs active;
- App Store/Play release requirements completed by authorized humans;
- release and rollback recorded;
- launch waves governed by safety/liquidity/retention thresholds.

**Gate:** one healthy marketplace before a second thin city. Press, virality, or raw MAU is not sufficient evidence to expand.

## M6 — Operate, learn, and expand conditionally

Primary issue: #45 plus issues created from observed incidents/experiments.

Operating loop:

`OBSERVE → TRIAGE → ACT → VERIFY → LEARN`

Priority order:

1. safety;
2. reliability;
3. successful reciprocal conversations;
4. retention;
5. conversion/revenue;
6. cost efficiency.

Second-city expansion requires first-city evidence on:

- cohort liquidity / eligible candidates per active user;
- Meaningful Connections / 100 verified WAU;
- D30 and 8-week retention;
- report/block/scam rates and moderation capacity;
- CAC per verified active user and per meaningful connection;
- repeatable creator/community acquisition;
- compatibility experiment evidence showing durable value beyond novelty;
- Couple Mode or premium monetization behaving without safety/privacy regression.

## Cross-milestone Human Gates

Codex should continue autonomously until work requires one of the documented Human Gates, including:

- external contracts/vendor commitments;
- qualified legal approval;
- material spend outside configured budget;
- App Store/Play contractual acceptance/submission authority;
- irreversible production data destruction;
- serious Trust & Safety judgment requiring an accountable human;
- public incident communications;
- unresolved material privacy/safety risk.

A blocker in one workstream must not freeze unrelated unblocked work.
