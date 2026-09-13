# INYEON Architecture

Status: target architecture for M0/M1; implementation ADRs may refine vendor choices without violating the boundaries below.

## 1. Architecture goals

INYEON must be easy to change, test, deploy, observe, and roll back. The architecture should optimize first for correctness, privacy, safety, and developer velocity rather than premature scale.

Core constraints:

- dating/profile data, sensitive birth data, compatibility logic, narrative generation, messaging, safety, and analytics are explicit boundaries;
- deterministic inputs and pinned methodology produce reproducible Saju results;
- LLMs never calculate charts or invent compatibility rules;
- exact DOB, birth time, birthplace, orientation, precise location, private messages, and verification artifacts must not leak into public profiles, analytics, logs, or unnecessary LLM calls;
- safety and eligibility override ranking;
- use managed services before self-operated distributed infrastructure.

## 2. Recommended repository shape

```text
inyeon/
├── apps/
│   ├── mobile/             # Expo / React Native
│   ├── admin/              # trust & safety / support console
│   └── marketing-web/      # landing, methodology, policies
├── services/
│   ├── api/                # product API / auth boundary / orchestration
│   ├── saju-engine/        # deterministic Four Pillars calculation
│   ├── matching/           # candidate generation / ranking
│   ├── narrative/          # structured facts -> validated LLM copy
│   └── moderation/         # abuse/safety workflows
├── packages/
│   ├── domain/
│   ├── api-contracts/
│   ├── compatibility-rules/
│   ├── analytics-events/
│   ├── design-system/
│   └── privacy/
├── data/
│   └── non-pii-reference/
├── tests/
│   ├── golden-charts/
│   ├── compatibility/
│   ├── security/
│   └── e2e/
├── infra/
│   ├── terraform/
│   └── environments/
└── docs/
    ├── adr/
    ├── methodology/
    ├── privacy/
    ├── trust-safety/
    └── runbooks/
```

No production birth data, photos, messages, biometrics, or other PII may ever be committed to the repository.

## 3. Technology baseline

Preferred initial stack:

- **Mobile:** Expo + React Native + TypeScript.
- **Admin / marketing:** Next.js + TypeScript.
- **API:** TypeScript with Fastify or NestJS; choose one in an ADR and keep API contracts typed.
- **Saju engine:** deterministic Python service/package if astronomical/calendar validation is materially easier there; otherwise a strongly-tested TypeScript package is acceptable. The engine must remain isolated and versioned either way.
- **Primary database:** managed PostgreSQL; use PostGIS only where geospatial lookup materially requires it.
- **Cache / ephemeral state:** managed Redis only when justified by measured need.
- **Async jobs:** managed queue such as SQS or equivalent.
- **Media:** object storage + CDN; signed upload/download URLs.
- **Secrets / keys:** managed KMS + secret manager.
- **Runtime:** small containerized services on a managed runtime (for example ECS/Fargate or equivalent). Do not introduce Kubernetes before operational evidence justifies it.
- **CI/CD:** GitHub Actions.
- **IaC:** Terraform.
- **Observability:** OpenTelemetry + managed logs/metrics/traces/error tracking.
- **Feature flags:** managed flag service or thin internal abstraction with durable assignments.
- **LLM:** provider abstraction behind server-side structured-output validation.

An even leaner alpha may use managed auth + managed Postgres, but convenience must not collapse sensitive-data boundaries.

## 4. System decomposition

```text
Mobile / Web
    ↓
API Gateway / Product API
    ├── Auth & account
    ├── Profile & preferences
    ├── Discovery / likes / matches
    ├── Messaging
    ├── Privacy / export / deletion
    └── Safety endpoints

Product API
    ├── Sensitive Birth Data Vault
    ├── Saju Engine
    │     ├── IANA timezone data
    │     ├── solar-term / ephemeris reference
    │     └── immutable chart snapshot
    ├── Compatibility Feature Generator
    ├── Versioned Rule Engine
    ├── Ranking Service
    ├── Narrative Service
    │     └── schema + safety validator
    ├── Moderation / case management
    └── Privacy-safe event stream → analytics warehouse
```

## 5. Data boundaries

### 5.1 Identity / account

Contains authentication identifiers, age-gate state, account status, consent versions, locale, and coarse service metadata.

### 5.2 Dating profile

Contains only fields necessary to present the public dating profile: display name, public age, metro/distance bucket, photos, prompts, intent, and visible preference-compatible fields.

### 5.3 Sensitive birth vault

Contains encrypted:

- local DOB;
- local birth time when known;
- precision `exact | approximate | unknown`;
- birthplace resolver token;
- timezone ID;
- any short-lived coordinates needed for deterministic calculation.

Application code should derive the minimum chart representation required by downstream features, then avoid propagating raw birth inputs further than necessary.

### 5.4 Immutable chart snapshot

Store:

- normalized pillars/features;
- calculation profile version;
- timezone-data version;
- ephemeris/solar-term reference version;
- input-completeness/confidence metadata;
- derived-feature version.

A chart snapshot is derived personal data and must still be covered by deletion/export policy.

### 5.5 Compatibility snapshot

Store pair-level structured evidence:

- chart IDs / pseudonymous subject IDs;
- compatibility feature vector;
- rule IDs/versions;
- confidence limitations;
- ranking feature family values.

Keep traditional features separable from learned behavioral features.

### 5.6 Messaging

Store message content in the messaging domain. Do not send raw message text to analytics. Moderation access must be role-bound and audited.

### 5.7 Analytics

Events use pseudonymous IDs and approved enums/buckets only. No raw birth data, private message text, exact coordinates, verification images, or government IDs.

## 6. Saju calculation contract

Raw normalized input:

```text
birth_date_local
birth_time_local | null
birth_time_precision = exact | approximate | unknown
birthplace resolver output
timezone_id
calculation_profile_version
timezone_data_version
```

Required properties:

1. same normalized input + same profile/version → same normalized output;
2. methodology choices documented in `SAJU_ENGINE_SPEC.md` and versioned profile files;
3. historic timezone/DST behavior pinned and reproducible;
4. solar-term boundaries deterministic and testable;
5. unknown time never replaced with a fabricated hour;
6. hour-dependent rules suppressed or down-weighted when not supported;
7. at least 200 expert/reference golden fixtures before public launch.

## 7. Compatibility rule architecture

Rules are code/data, not prose prompts.

Example shape:

```json
{
  "rule_id": "PAIR-DAY-BRANCH-CLASH-001",
  "version": "1.0.0",
  "requires": ["user.day_branch", "candidate.day_branch"],
  "evidence": {"relationship": "clash"},
  "dimensions": {"pace": -1, "novelty": 2, "stability": -1, "growth": 2},
  "allowed_narratives": ["different decision rhythms", "productive tension"],
  "prohibited_narratives": ["doomed marriage", "infidelity", "divorce prediction"],
  "expert_validation": "reviewed"
}
```

Rule engine output must be explainable and versioned.

## 8. Ranking architecture

Candidate generation:

```text
18+ / account eligibility
→ mutual orientation/gender/intent compatibility
→ age preferences
→ blocks/reports/safety exclusions
→ metro/distance policy
→ deal-breakers/account activity
→ eligible pool
```

Ranking feature families:

1. profile/behavioral relevance;
2. activity/profile quality;
3. marketplace diversity/exposure controls;
4. bounded Gung-hap features.

Saju may adjust ranking within an eligible pool. It must never override safety, blocks, or mutual preference eligibility.

Every experiment must preserve the ability to run a baseline with Gung-hap weight = 0.

## 9. LLM narrative boundary

The LLM receives structured compatibility evidence, never the full private user record.

Allowed example:

```json
{
  "pair_id": "pseudo_123",
  "relationship_features": [],
  "rule_evidence": [],
  "confidence": {},
  "relationship_stage": "pre_match",
  "tone": "warm_concise"
}
```

Normally exclude:

- legal name;
- exact DOB/time;
- birthplace;
- exact current location;
- private messages;
- verification artifacts.

Required structured output:

```json
{
  "headline": "Builder + Explorer",
  "what_clicks": "...",
  "watch_for": "...",
  "question_to_ask": "...",
  "rule_ids": ["..."],
  "disclaimer_class": "reflective"
}
```

Validate:

- schema;
- rule references;
- prohibited claims;
- identity-sensitive language;
- maximum length;
- methodology/prompt/model versions.

Narrative reproducibility key:

`chart_version + rule_version + prompt_version + model_version`.

## 10. Core entities

- `User`
- `DatingProfile`
- `DatingPreference`
- `BirthInput`
- `BirthChart`
- `CompatibilitySnapshot`
- `Like`
- `MatchRecord`
- `Narrative`
- `Message`
- `SafetyReport`
- `SafetyCase`
- `Verification`
- `CoupleRelationship`
- `OutcomeFeedback`
- `ExperimentExposure`
- optional `BacktestResult`
- `SubscriptionEntitlement`
- `AuditLog`

Schemas must define ownership, retention, encryption class, export behavior, and deletion behavior.

## 11. API boundary sketch

```text
POST   /v1/auth/register
POST   /v1/onboarding/birth-input
POST   /v1/charts/compute
GET    /v1/me/chart-summary

GET    /v1/discovery
POST   /v1/likes
POST   /v1/passes
GET    /v1/inyeon/today

GET    /v1/matches
GET    /v1/matches/{id}/gunghap
GET    /v1/matches/{id}/messages
POST   /v1/matches/{id}/messages
POST   /v1/matches/{id}/we-met

POST   /v1/couples/invitations
POST   /v1/couples/{id}/accept
GET    /v1/couples/{id}/report
DELETE /v1/couples/{id}

POST   /v1/safety/reports
POST   /v1/safety/blocks
DELETE /v1/matches/{id}

GET    /v1/privacy/export
DELETE /v1/me

GET    /v1/methodology
GET    /v1/methodology/{version}
```

All mutations require authorization, validation, rate limiting, and idempotency where retries could create duplicated state.

## 12. Security model

Required controls:

- least-privilege service identities;
- encryption in transit and at rest;
- application/KMS-backed encryption for sensitive birth inputs where justified;
- admin access with RBAC and audit logs;
- no PII in application logs by default;
- parameterized queries / ORM hardening;
- CSRF/session protections appropriate to client type;
- authorization tests for every object boundary;
- IDOR regression suite;
- signed media access;
- secret scanning and dependency scanning;
- rate limits for auth, discovery abuse, likes, chat, reports, and export/delete operations;
- threat modeling before city beta;
- backup/restore drills before production launch.

## 13. Trust & safety architecture

Safety is a product domain, not an afterthought.

Minimum flow:

`report/block signal → risk classification → immediate user protection → moderation case → human review where needed → action → appeal/escalation/audit`

Block must immediately remove discovery/messaging visibility in both directions.

High-severity cases require explicit human escalation paths.

## 14. Testing strategy

Required layers:

- unit tests for domain logic;
- property tests for deterministic Saju invariants;
- ≥200 golden-chart fixtures;
- positive/negative/missing-input tests for every compatibility rule;
- pair-order symmetry tests where logically required;
- API/DB integration tests;
- auth/IDOR tests;
- matching exclusion tests;
- privacy-leak tests for logs/analytics/LLM payloads;
- moderation/report/block tests;
- E2E onboarding → discovery → match → chat → report/block/delete;
- payment lifecycle tests;
- migration tests;
- accessibility tests;
- performance/load tests for discovery/chat;
- production smoke tests.

## 15. Environments and release model

```text
local → test → staging → production
```

No direct production deployment from a developer branch.

Production release gates are defined in `CODEX.md` and `OPERATIONS.md`.

## 16. ADRs required before M1 expansion

At minimum:

1. monorepo/package manager/runtime architecture;
2. API framework;
3. auth provider and session model;
4. managed Postgres provider and PII isolation strategy;
5. Saju engine language and ephemeris/timezone dependencies;
6. object storage/media pipeline;
7. messaging transport/storage;
8. moderation vendor vs internal controls;
9. analytics collection/warehouse;
10. feature-flag/experiment assignment;
11. LLM provider abstraction and retention policy;
12. staging/production runtime and IaC;
13. backup/restore and disaster recovery.

The default decision criterion is the simplest reversible option that satisfies safety, privacy, reproducibility, and launch requirements.
