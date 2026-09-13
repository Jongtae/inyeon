# INYEON Backlog Guide

GitHub Issues are the authoritative execution queue. This file is a durable map of the current research-backed backlog so Codex can understand intent, dependencies, and critical-path ordering without recreating the issue set.

Current backlog: **48 issues**, including seed Issue #1.

## Working rule

- Do not execute by issue number alone.
- Select the highest-priority unblocked issue on the critical path.
- If an issue is materially ambiguous, refine it in place rather than creating a duplicate.
- If research or implementation reveals a new dependency, create the smallest new issue and update the dependency text of affected issues.
- Stop only for a documented Human Gate; continue unrelated work when one stream is blocked.

## Recommended first execution sequence

The first Codex run should treat Issue #1 as the coordinator issue and then move into the M0 critical path:

```text
#1 Bootstrap/reconcile architecture + toolchain + ADRs
  ├── #2 Product principles v1
  ├── #3 Saju advisory process        [Human outreach gate after prep]
  ├── #5 Pilot-city scorecard
  ├── #6 Inclusive compatibility taxonomy
  ├── #8 korean-saju-v1 calculation profile
  └── #16 Domain schemas / privacy classes / API contracts
          ↓
#17 Auth/account      #18 Birth vault
          ↓              ↓
      #20 Profile       #9 Timezone normalization
          ↓              ↓
      #21 Baseline      #10 Solar terms
      ranking           ├── #11 Year/month pillars
          ↓             └── #12 Day/hour + uncertainty
      #22 Like/match             ↓
                               #13 Derived chart features
                                  ↓
                         #14 Golden fixture corpus
                                  ↓
                         #19 Chart-computation API
                                  ↓
                         #33 Compatibility rule DSL
                                  ↓
                         #34 Confidence/evidence model
```

Mobile work can begin in parallel after the contracts stabilize:

```text
#26 Onboarding → #27 Discovery → #30 Chat
                   ↘ #31 Report/block/unmatch
```

Platform/safety/analytics should not wait until the end:

```text
#47 Platform/IaC/CI/CD
#37 Privacy map/Privacy Center
#38 Moderation pipeline/admin
#41 Analytics/experiments/dashboard
```

## Epic map

### Product, culture, research, and GTM foundations

- #2 — Product principles and non-goals v1 — **P0 / M0**
- #3 — Korean Saju advisory panel/review process — **P0 / M0**
- #4 — US concept interviews and compatibility-language usability — **P0 / M0–M1**
- #5 — Launch-market scorecard / pilot-city gate — **P0 / M0**
- #6 — Inclusive compatibility taxonomy / prohibited claims — **P0 / M0**
- #7 — Research-ready clickable prototype — **P1 / M0–M1**

### Deterministic Saju engine

- #8 — `korean-saju-v1` calculation profile — **P0 / M0**
- #9 — Historical timezone / birth-location normalization — **P0 / M1**
- #10 — Solar-term calculation / reference versioning — **P0 / M1**
- #11 — Year/month pillar calculation — **P0 / M1**
- #12 — Day/hour pillar calculation + birth-time uncertainty — **P0 / M1**
- #13 — Derived chart features for compatibility v1 — **P0 / M1**
- #14 — ≥200 golden-chart fixture corpus — **P0 / M1**
- #15 — User-facing methodology/limitations page — **P1 / M1–M2**

### Backend and dating core

- #16 — Domain schemas / ownership / retention / API contracts — **P0 / M0–M1**
- #17 — Auth / account lifecycle / consent / 18+ gate — **P0 / M1**
- #18 — Encrypted sensitive birth-input vault — **P0 / M1**
- #19 — Deterministic chart API / immutable snapshots — **P0 / M1**
- #20 — Dating profile / mutual-preference APIs — **P0 / M1**
- #21 — Eligibility filtering / candidate retrieval / baseline ranking — **P0 / M1**
- #22 — Like / Pass / mutual-match state machine — **P0 / M1**
- #23 — Realtime messaging / anti-abuse controls — **P0 / M2**
- #24 — Account export / deletion cascade — **P0 / M2**
- #25 — Couple Mode relationship object/backend — **P1 / M4**

### Mobile app

- #26 — Account/profile/preferences/birth onboarding — **P0 / M1**
- #27 — Discovery feed/profile detail — **P0 / M1**
- #28 — Limited Inyeon Match experience — **P1 / M3**
- #29 — Gung-hap summary / Why this? / deep dive — **P1 / M3–M4**
- #30 — Match inbox / chat UI — **P0 / M2**
- #31 — Report / block / unmatch / Safety Center UX — **P0 / M1–M2**
- #32 — Localization/content keys / Korean glossary — **P1 / M2**
- #48 — Post-date feedback / Couple Mode mobile — **P1 / M4**

### Matching, compatibility, and AI

- #33 — Versioned compatibility-rule DSL / pair feature generator — **P0 / M1–M2**
- #34 — Compatibility confidence / unknown-time evidence model — **P0 / M2**
- #35 — Structured LLM narrative service — **P1 / M3–M4**
- #36 — A/B/C compatibility outcome experiment — **P1 / M3–M4**

### Privacy, safety, and security

- #37 — Data map / privacy threat review / Privacy Center — **P0 / M2–M4**
- #38 — Moderation case pipeline / admin console / abuse detection — **P0 / M2–M3**
- #39 — Photo/liveness verification integration — **P1 / M4**
- #40 — Threat model / penetration-test readiness — **P1 / M4**
- #46 — US legal/app-store/UGC/subscription launch-readiness — **P0 / M4–M5**

### Analytics and experimentation

- #41 — Privacy-safe event pipeline / assignments / dashboards — **P0 / M2–M3**

### Revenue

- #42 — Subscriptions / entitlements / receipt validation — **P1 / M4**

### Growth and launch

- #43 — Referral / invite / share cards — **P1 / M3–M4**
- #44 — Pilot-city supply seeding / invite-only beta / liquidity gates — **P0 / M3–M5**
- #45 — Second-city expansion gate / Couple Mode growth — **P2 / M6**

### Platform and operations

- #47 — Reproducible staging/production infrastructure, CI/CD, observability, backup/restore — **P0 / M2–M4**

## Critical business hypotheses attached to the backlog

The implementation should preserve the ability to falsify these hypotheses:

1. K-culture framing can attract qualified US users without reducing trust.
2. Gung-hap explanations improve reciprocal conversation quality, not only Like rate.
3. Bounded Saju ranking adds value beyond explanation-only presentation.
4. Unknown birth time can degrade gracefully without destroying onboarding completion.
5. Balanced `What clicks + Worth watching` language is trusted more than positive-only horoscope prose.
6. Scarce Inyeon Match increases attention without damaging retention or marketplace breadth.
7. Contextual date questions improve first reply or conversation depth.
8. Verification creates enough trust value to justify its friction and privacy cost.
9. One-city density performs materially better than thin multi-city launch.
10. Couple Mode creates legitimate post-match value and retention without trapping users in dating discovery.

## Release blockers that outrank feature completion

A feature-complete build is still **No-Go** for public launch if any of the following is true:

- block/report is unreliable;
- serious moderation has no accountable human process;
- account deletion/export is incomplete;
- exact/precise location can leak;
- sensitive birth/profile/message data reaches ordinary logs, analytics, or unnecessary LLM payloads;
- Saju engine correctness is not validated against the golden corpus;
- compatibility can override safety or mutual eligibility;
- production backup/restore or rollback is untested;
- critical security/privacy findings remain open;
- required legal/app-store/vendor Human Gates are unresolved;
- the pilot marketplace lacks sufficient compatible supply for core cohorts.

## Human Gates embedded in the backlog

Codex can prepare everything up to these boundaries but must not silently cross them:

- recruiting/contracting paid Saju advisors or research participants;
- selecting a paid verification/analytics/hosting vendor when spend exceeds configured budget;
- qualified US legal counsel signoff;
- acceptance of Apple/Google/vendor terms;
- final paid production subscriptions/accounts where authorization is missing;
- production destructive data operations;
- serious safety adjudication / law-enforcement escalation / public incident communication;
- pilot-city broad-open decision when safety/liquidity gates are borderline.

## Backlog maintenance contract

At the end of each completed issue, Codex should:

1. verify acceptance criteria and required tests;
2. update affected docs/ADRs;
3. add or adjust dependencies only when evidence changed;
4. avoid duplicating an existing issue;
5. create regression issues from material review/incident findings;
6. select the next highest-priority unblocked critical-path issue;
7. continue without waiting unless a Human Gate applies.

`ROADMAP.md` defines milestone outcomes. GitHub Issues define executable work. This file exists only to preserve the execution graph and research intent.
