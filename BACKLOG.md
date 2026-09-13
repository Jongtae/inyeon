# INYEON Backlog Guide

GitHub Issues are the authoritative execution queue. This file explains how to interpret the issue set under the active **Independent Release Mode**.

The repository contains historical marketplace issues plus the newer static-release issues. Codex must not assume an old P0 marketplace issue outranks the active release path.

## Active release objective

Ship a real public, production-grade static web product with:

- deterministic Saju/Four Pillars calculation;
- validated open-source Manseryeok adapter;
- uncertainty-aware compatibility logic;
- sourced public figures;
- clearly synthetic characters;
- polished browser UX;
- privacy-safe sharing;
- zero-retention personal-data handling;
- GitHub Pages production deployment;
- governed Reddit feedback loop.

Business success is optional. Release quality is not.

## Current active critical path

```text
#1 Bootstrap/reconcile repo + toolchain + ADRs
  ↓
#8 Adopt/validate open-source Manseryeok adapter
  ├─ #9 timezone/location behavior validation
  ├─ #10 solar-term boundary/reference validation
  ├─ #11 year/month pillar differential validation
  └─ #12 day/hour + uncertainty validation
       ↓
#13 derived chart features
       ↓
#14 golden/reference corpus
       ↓
#6 inclusive compatibility taxonomy / prohibited claims
       ↓
#33 compatibility-rule DSL/evidence
       ↓
#34 evidence-availability/uncertainty model
       ↓
#50 public-figure dataset      #49 synthetic-character lab
          ↘                    ↙
#35 deterministic narrative   #53 integrated static web comparison UI
          ↘                    ↙
              integrated UX
                 ↓
#43 privacy-safe share/card/link system
                 ↓
#52 zero-retention privacy verification
                 ↓
#47 GitHub Pages production release
                 ↓
#51 Reddit governed feedback loop
```

Issue #35 owns deterministic narrative composition and #53 owns the integrated static web shell; refine these in place rather than creating duplicate work.

## Active P0/P1 issue families

### Saju correctness

- #8 — adopt/validate pinned open-source Manseryeok behind `InyeonSajuAdapter` — **P0**
- #9 — historical timezone/birth-location behavior — **P0**, validate/wrap first, greenfield only for gaps
- #10 — solar-term/reference behavior — **P0**, validate/pin first, greenfield only for gaps
- #11 — year/month pillars — **P0**, differential validation around upstream/profile conventions
- #12 — day/hour + unknown/approximate-time behavior — **P0**
- #13 — derived compatibility features — **P0**
- #14 — ≥200 golden/reference fixtures — **P0**
- #15 — user-facing methodology/limitations — **P1**

### Compatibility and explanation

- #6 — inclusive compatibility taxonomy / prohibited claims — **P0**
- #33 — versioned compatibility-rule DSL / pair evidence — **P0**
- #34 — categorical evidence availability / unknown-time model — **P0**
- historical #35 LLM narrative service is **not** the default first-release runtime; prefer deterministic client-side narrative composition unless an issue is explicitly rewritten.

### Public/synthetic reference product

- #49 — transparent synthetic compatibility sandbox / Inyeon Lab — **P0**
- #50 — sourced public-figure birth dataset — **P0**

### Privacy/platform/distribution

- #52 — client-only zero-retention personal-data boundary — **P0**
- #47 — release-grade GitHub Pages + GitHub Actions production path — **P0**
- #43 — client-side claim-free cards / share-safe links / compare-with-me invitation — **implemented for the candidate release; deployed evidence remains #47-owned**
- #51 — Reddit release-feedback loop with governed auto-improvement — **P0 after production candidate exists**

## Marketplace issues: deferred, not deleted

The following historical families are outside the first-release scope unless the owner explicitly activates Marketplace Mode:

- #5 pilot-city selection;
- #16–#25 account/backend/dating core;
- #26–#32 native/mobile dating flows;
- #36 dating A/B/C outcome experiment;
- #37–#42 marketplace privacy/moderation/verification/analytics/payments;
- #44–#48 city seeding, expansion, post-date/Couple Mode portions that require real users.

Some of those issues may still contain useful future requirements. Do not implement them merely because their historical priority says P0.

## Open-source Manseryeok policy

The first release must not spend weeks rebuilding commodity calendrical primitives without evidence.

Preferred rule:

```text
adopt → wrap → pin → differential-test → golden-test → patch only proven gaps
```

The INYEON-owned value lives above that layer:

- normalized uncertainty representation;
- compatibility feature ontology;
- rule engine;
- explanations;
- public/synthetic exploration;
- privacy-safe sharing;
- eventual real-user outcome learning if Marketplace Mode is activated.

## Public-figure data contract

Public figures are reference records, not fake members.

Every production record should preserve source provenance plus categorical birth-data/source status. Unknown/disputed birth time must never be silently defaulted. Image use must be license-aware.

Initial target: 500–2,000 useful, diverse, recognizable records before scaling further.

## Synthetic-character contract

Synthetic characters solve the empty-product problem, not marketplace liquidity.

They are visibly fictional, reproducible, distribution-tested, and technically unable to enter Like/Match/Message states.

## Sharing contract

Release sharing should support:

1. browser-generated image card;
2. share-safe reference/invitation link with a strict non-sensitive allowlist;
3. explicit `Compare with me` invitation containing no personal representation; each person re-enters details locally;
4. stable public-figure pages with public-only social/OG metadata after #47 fixes the production origin, where practical.

Raw or derived personal data never belongs in URLs, share cards, analytics, or remote requests. Until approved relationship rules and copy exist, sharing contains no archetype or relationship claim.

## Reddit feedback contract

Reddit is the preferred early public-feedback channel, but automation is governed.

Codex may create/configure the Reddit account and publish posts or replies when technically available, legally permitted, and community rules are clear. Stop only for CAPTCHA, email/phone/identity verification, MFA, owner-only developer/API terms acceptance or credential recovery, ambiguous community rules, or material legal/reputational risk.

Feedback may be ingested, clustered, and converted into GitHub issues. Only bounded/reversible/evidence-backed fixes may auto-enter the implementation pipeline. Methodology, privacy/security, public claims, and major product direction remain human-reviewed.

## First-release blockers

A feature-complete build is still **No-Go** if:

- chart output is not deterministic/versioned;
- golden/reference tests expose unresolved material boundary errors;
- unknown birth time is fabricated;
- personal birth/comparison values leave browser memory;
- protected values enter storage, URLs, logs, analytics, or third-party requests;
- public-figure provenance or birth-data/source status is missing;
- synthetic figures can be mistaken for real members;
- sharing leaks protected inputs;
- browser runtime contains secrets;
- GitHub Pages direct routes/deep links are broken;
- CI/deploy/rollback is not reproducible;
- critical accessibility/security/privacy defects remain open.

## Human Gates for the active release

Codex should stop for:

- paid/contracted Saju advisor engagement if required;
- custom-domain purchase/DNS credentials if owner action is required;
- Reddit CAPTCHA, email/phone/identity verification, MFA, owner-only platform/developer terms acceptance, or credential recovery;
- ambiguous subreddit/community-rule compliance or material legal/reputational risk;
- new paid vendor/material spend;
- introducing GCP/backend persistence that changes the zero-retention architecture;
- material Saju methodology changes;
- material privacy/security/public-claim decisions.

## Backlog maintenance contract

At the end of each completed issue:

1. verify acceptance criteria/tests;
2. update docs/ADRs when evidence changes;
3. adjust dependencies rather than duplicating issues;
4. preserve zero-retention and release-grade invariants;
5. select the next highest-value unblocked issue on the active critical path;
6. continue until a real Human Gate is reached.

`ROADMAP.md` defines milestone outcomes. GitHub Issues define executable work. Historical marketplace requirements remain reference material until explicitly reactivated.
