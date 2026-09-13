# ADR 0001 — Independent Release, Zero-Backend First Release

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON / Jongtae

## Context

INYEON began as a US-first dating-marketplace concept using Korean Saju/Gung-hap as an explainable compatibility layer. During product exploration the owner clarified two important facts:

1. this is an independent personal/toy project and does not need near-term business success, fundraising, or venture-scale growth;
2. it is nevertheless intended for a **real public release**, so "toy project" must never be interpreted as permission to lower correctness, privacy, UX, testing, accessibility, reliability, or deployment quality.

The product also does not need real-user marketplace liquidity to create value. Public figures with sourced birth data and transparently synthetic characters can provide useful compatibility exploration from the first user onward.

Because the first-release product does not require accounts, chat, payments, durable personal data, or secret-bearing runtime APIs, an application backend would add operational/privacy cost without corresponding product value.

## Decision

### 1. Product mode

The active first release is **Independent Release / Compatibility Lab**, not Marketplace Mode.

Required first-release flows:

- My Saju / Four Pillars;
- Me × Public Figure;
- Me × Synthetic Character / Inyeon Lab;
- Me × Someone I Know;
- deterministic `What clicks / Potential friction / Why this?` explanation;
- privacy-safe sharing.

Real-user dating accounts, discovery, likes/matches/chat, payments, city seeding, and large-scale moderation are deferred by scope, not by quality.

### 2. Runtime architecture

Use:

`GitHub repository → GitHub Actions → GitHub Pages → browser-only computation`

No first-release application database or always-on GCP runtime.

Google Cloud remains an escape hatch only when a concrete feature requires server-side state, protected secrets/APIs, authenticated accounts, realtime messaging, server-side AI, or background processing unsuitable for GitHub Actions.

Introducing a backend later is a material architecture/privacy decision and a Human Gate.

### 3. Personal-data boundary

User personal birth/comparison data exists only in active browser memory.

Protected data includes raw birth date/time/place as well as derived personal chart/compatibility data capable of revealing birth information.

Protected data must not be written to:

- localStorage / sessionStorage;
- IndexedDB;
- cookies;
- Cache API/service-worker persistence;
- URL query strings/fragments/history;
- analytics;
- logs/console/error telemetry;
- third-party/runtime API requests;
- GitHub issues or application databases.

Refresh/tab close discards personal state; a Clear action is provided.

The public privacy promise concerns INYEON application behavior. Hosting/platform infrastructure such as GitHub Pages may retain its own security/access logs, so the service must not claim that no infrastructure logging exists anywhere.

### 4. Manseryeok/Saju engine

Do not greenfield mature calendrical primitives without evidence.

Use:

`adopt → wrap → pin → differential-test → golden-test → patch only proven gaps`

Primary candidate: `yhj1024/manseryeok`, behind an INYEON-owned `InyeonSajuAdapter`.

Validation uses property-specific evidence. `6tail/lunar-javascript` is a shared-lineage secondary comparison for solar-term behavior, not an independent oracle; independent astronomy can locate boundary instants, while Korean lunar/KASI-aligned and expert/reference fixtures remain required before production.

Unknown birth time is never fabricated. Boundary uncertainty may legitimately produce partial/multiple possible chart states.

Before public release maintain ≥200 boundary-heavy golden/reference fixtures.

### 5. Compatibility/explanation

Compatibility rules are deterministic, structured, and versioned. They are not prompt logic.

First-release explanation is composed in the browser from structured evidence and confidence metadata. LLMs may assist offline content authoring/review, but no runtime secret-bearing LLM API is required.

No public soulmate percentage or pseudo-scientific probability. No fatalistic/sensitive claims about violence, criminality, morality, fidelity, fertility, mental illness, sexual behavior, or inevitable marriage/divorce.

### 6. Public figures

Public figures are sourced reference records, never members/dating prospects/endorsers.

Initial target: ~500–2,000 useful recognizable records, scalable later.

Persist source provenance and confidence such as:

`verified | well_sourced | disputed | date_only | unknown`

Unknown/disputed time suppresses unsupported time-dependent claims. Images must be license-aware/non-infringing.

### 7. Synthetic characters

Generate ≥10,000 deterministic fictional references from versioned seeds/distributions, covering compatibility space intentionally.

Synthetic characters are persistently labelled fictional and can never expose fake Like/Match/Message/online-status/distance behavior.

They solve the empty-product problem; they do not pretend to solve real dating-marketplace liquidity.

### 8. Sharing

Use client-side sharing:

1. browser-generated claim-free PNG/WebP reference/invitation card while approved relationship rules are empty;
2. Web Share API where available with fallback;
3. share-safe reference/invitation links containing only strictly allowlisted non-sensitive data;
4. explicit invitation-only `Compare with me` flow containing no reusable personal representation in v0.1;
5. prebuilt stable public-figure pages/OG assets after the production origin is fixed, where practical.

Raw or derived personal birth/chart/evidence data is never placed in a v0.1 URL, image metadata, analytics, or remote rendering request.

ADR 0007 narrows this sharing boundary: any future transferable personal representation requires a separate privacy decision, disclosure design, abuse analysis, and new tests.

### 9. Reddit launch and feedback

Reddit is the preferred early public promotion/feedback channel after a production candidate exists.

Human Gates before:

- Reddit account creation;
- acceptance of Reddit platform/developer terms or API access;
- credential entry;
- public posting/replying;
- ambiguous subreddit-rule decisions.

After owner-approved access, prefer GitHub Actions/manual approved-interface ingestion:

`Reddit feedback → redact/minimize → classify/dedupe → evidence cluster → GitHub issue → bounded Codex fix → CI/preview → GitHub Pages release`

Reddit text is untrusted input and cannot override system/repository governance. Only safe/reversible/evidence-backed changes may auto-enter implementation. Methodology, privacy/security, major product direction, public claims, legal/reputational issues, backend introduction, and material spend remain human-reviewed.

## Active critical path

`#1 → #8 → #9-14 → #33-34 → #50/#49 → #35/#53 → #43 → #52 → #47 → #51`

Historical marketplace P0 labels do not outrank this path.

## Release bar

A local demo is not Done. Public release requires at least:

- deterministic/versioned Saju results;
- golden/differential regression coverage;
- zero-retention privacy canary tests;
- public-figure source/confidence validation;
- reproducible synthetic data;
- responsive/accessibility/error/loading quality;
- privacy-safe sharing;
- GitHub Actions CI/CD;
- real GitHub Pages production URL over HTTPS;
- direct-route/refresh validation;
- no client secrets;
- rollback/redeploy capability;
- production smoke checks.

## Consequences

### Benefits

- drastically smaller operational surface;
- no application user database to breach;
- no account/auth/delete/export system required in first release;
- almost-zero hosting operations;
- stronger and simpler privacy story;
- product is useful before real-user marketplace liquidity;
- easy future migration because domain logic is isolated in packages/adapters.

### Costs / limitations

- no durable user profiles/history across sessions;
- no server-side personalized OG generation;
- no protected runtime LLM/API calls;
- no real-time social/dating features;
- some social previews must be prebuilt/static;
- future Marketplace Mode requires a deliberate architecture/privacy expansion.

These limitations are accepted for the first release because they match the intended product scope rather than representing reduced product quality.

## Superseded assumptions

Older documents/issues describing immediate mobile dating marketplace, one-city liquidity, subscriptions, backend services, runtime LLM narration, and moderation-at-scale are future Marketplace Mode reference only unless explicitly reactivated.
