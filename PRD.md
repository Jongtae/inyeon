# INYEON Product Requirements Document

Status: active product source of truth for the first public release

## 1. Product thesis

**INYEON — Explore connection through Korean Saju and Gung-hap.**

INYEON is an independent personal project intended for a real public release. It is not being optimized for near-term startup, fundraising, or revenue outcomes, but it is held to a release-grade quality bar.

The first product is a **Korean compatibility lab**, not a two-sided dating marketplace.

Primary user question:

> **What kinds of people and relationship dynamics seem interesting with my Saju?**

Secondary question:

> **Why might this dynamic feel easy, complementary, tense, or intriguing?**

Do not present Saju or Gung-hap as scientifically validated predictors of relationship success.

## 2. First-release product shape

The product must be valuable with a single user and no marketplace liquidity.

Core modes:

1. **My Saju** — enter birth data and get a deterministic Four Pillars result with uncertainty disclosure.
2. **Me × Public Figure** — compare with globally recognizable public figures using sourced birth data.
3. **Me × Synthetic Character** — explore thousands of clearly fictional reference characters across the compatibility space.
4. **Me × Someone I Know** — optionally compare with another person whose birth information the user enters.
5. **Share** — generate privacy-safe local share cards and links.

Future real-user dating/matching remains an optional later mode.

## 3. Release principles

1. Independent project does not mean prototype quality.
2. Build less, but build it for real.
3. Compatibility is context, not destiny.
4. No public soulmate percentage, stars, or pseudo-scientific probability.
5. LLMs may help author copy during development, but do not calculate charts or decide rules.
6. Unknown birth time remains unknown; never fabricate noon or any fallback hour.
7. User personal birth/comparison data is processed locally and not stored/transmitted by INYEON application code.
8. Public figures, synthetic characters, and real users are distinct entity types.
9. Public figures are reference examples, not members, dating prospects, or endorsers.
10. Synthetic characters are visibly fictional and never simulate real marketplace activity.
11. Korean Saju/Gung-hap is described as Korean practice within the broader East Asian Four Pillars tradition.
12. Real production deployment, CI, accessibility, privacy testing, and rollback are required for release.

## 4. Core experience

### 4.1 My Saju

Input:

- birth date;
- birth time: exact / approximate / unknown;
- birthplace only as needed for deterministic normalization.

The browser computes the chart locally through `InyeonSajuAdapter`.

Output includes:

- Four Pillars / Eight Characters when supported by the available precision;
- confidence/uncertainty disclosure;
- key derived features used by compatibility;
- methodology/version disclosure.

Personal input/result state is in-memory only and disappears on refresh/tab close unless the user explicitly exports a local artifact.

### 4.2 Me × Public Figure

Users browse/search globally recognizable actors, musicians, athletes, creators, and other public figures.

Each record must preserve:

- source provenance;
- birth-data confidence;
- unknown/disputed time state;
- licensed/non-infringing image metadata if an image is shown.

Comparison output:

- relationship archetype/headline;
- **What clicks**;
- **Potential friction**;
- **Why this?** traditional evidence;
- uncertainty/limitations.

No implication of endorsement, participation, romantic availability, or claims about the public figure's private relationships.

### 4.3 Me × Synthetic Character

Synthetic characters provide broad compatibility exploration when no real dating supply exists.

They must:

- be generated reproducibly from versioned seeds/distributions;
- cover the chart/relationship space intentionally rather than only randomly;
- use the same compatibility engine as every other mode;
- be persistently labeled fictional;
- never expose Like/Match/Message/online-status/distance affordances.

Useful actions include:

- `Why this works`;
- `Potential friction`;
- `Compare`;
- `Save archetype` only if implemented locally without personal persistence;
- `Show another like this`.

### 4.4 Me × Someone I Know

Both subjects' personal data stays in browser memory only. The UI should remind users to enter another person's information only when they have an appropriate reason/permission to do so.

## 5. Saju / Manseryeok strategy

The calendar layer is treated as a validated commodity dependency, not the main proprietary value.

Preferred pipeline:

`Birth input → INYEON normalization → InyeonSajuAdapter → normalized Four Pillars → derived features → compatibility rules → explanation`

Primary open-source candidate: `yhj1024/manseryeok`, pinned behind an INYEON-owned adapter.

Validation references may include `6tail/lunar-javascript`, Korean lunar/KASI-aligned references, and expert-reviewed fixtures.

The product must maintain a versioned `korean-saju-v1` profile and a large golden corpus before public release.

## 6. Compatibility contract

Compatibility is structured evidence, not an LLM opinion.

Rules should be versioned and produce machine-readable evidence for dimensions such as:

- pace;
- communication rhythm;
- stability;
- novelty;
- complementarity;
- tension/growth.

Traditional relationships such as combinations/clashes may contribute evidence, but the UI should translate them into balanced, non-fatalistic relationship language.

Never infer or claim violence, criminality, morality, fidelity, fertility, mental illness, sexual behavior, or inevitable marriage/divorce outcomes from Saju.

## 7. First-release information architecture

Suggested top-level structure:

```text
Home
 ├─ My Saju
 ├─ Public Figures
 ├─ Inyeon Lab (synthetic)
 ├─ Compare Someone
 ├─ Methodology
 └─ Privacy
```

A user should reach a meaningful comparison quickly without creating an account.

## 8. Sharing

Sharing is a first-class feature because it drives discovery and Reddit/social discussion without requiring a backend.

### 8.1 Share result card

Generate an image in the browser and invoke native Web Share when available.

Default card may include:

- INYEON branding;
- public figure/synthetic subject name when applicable;
- relationship archetype;
- short `What clicks` / `Potential friction` copy;
- product URL.

Default card must not include raw birth date/time/place or other protected personal inputs.

### 8.2 Share-safe result link

Links may contain only an allowlisted non-sensitive result payload. Protected birth inputs are forbidden in query strings or URL fragments.

### 8.3 Compare-with-me

A separate explicit opt-in flow may create a link that lets another person compare with the sender. If any derived personal chart representation is embedded, the UI must explain exactly what is being shared before generation. This is never the default share action.

### 8.4 Public-figure pages

Build stable public pages and, where practical, prebuilt OG/social assets for recognizable public-figure entry points.

## 9. Privacy model

First-release privacy promise:

> **INYEON application code does not collect, transmit, or store your personal birth/comparison inputs. Calculations happen in your browser.**

Protected values must not enter:

- localStorage/sessionStorage;
- IndexedDB;
- cookies;
- service-worker/Cache API persistence;
- URLs;
- logs/console;
- analytics;
- third-party requests.

GitHub Pages itself may retain platform-level access/security logs; public copy must distinguish platform behavior from application-level zero retention.

## 10. Runtime / release architecture

First release is a static web application deployed through:

`GitHub repository → GitHub Actions → GitHub Pages`

No Cloud Run, Cloud SQL, Firebase database, or always-on GCP backend is required for the first release.

Google Cloud remains a future option only when a feature proves it needs server-side state, protected secrets/APIs, authenticated accounts, realtime communication, or durable user data.

## 11. Reddit launch and feedback loop

Reddit is the preferred initial promotion/feedback channel.

Target operating loop:

`owner-approved post → comments/reactions → compliant ingestion → dedupe/classify → GitHub issues → Codex bounded fix → CI/preview → production → changelog`

Human approval is required before:

- creating the Reddit account;
- accepting Reddit developer terms/app access;
- entering credentials;
- publishing posts/replies;
- any behavior that may conflict with subreddit rules.

Feedback can automatically create/implement only bounded, reversible, well-evidenced issues such as reproducible bugs, copy/layout defects, accessibility problems, or verifiable public-figure data corrections.

Human review remains required for methodology, privacy/security, major scope/positioning, public claims, and weak/contradictory feedback.

## 12. First-release scope

Required:

- deterministic Saju calculation via validated adapter;
- uncertainty-aware chart representation;
- derived compatibility features;
- versioned compatibility rule engine;
- deterministic explanation composer;
- 500+ sourced public-figure records, scalable further;
- synthetic-character generator/library;
- polished responsive web UI;
- share card + share-safe link flows;
- methodology/privacy pages;
- GitHub Pages CI/CD and rollback;
- golden/regression/privacy/E2E/accessibility tests;
- production smoke checks.

Deferred from first release:

- real-user dating discovery;
- accounts/auth;
- likes/matches/chat;
- payments;
- city marketplace seeding;
- large-scale moderation;
- server-side LLM runtime.

Deferred means out of current scope, not low quality.

## 13. Release success criteria

The release is successful when:

- a stranger can open the public URL and complete the core flow without setup/help;
- chart results are deterministic/versioned and pass golden tests;
- unknown/disputed birth-time cases degrade correctly;
- public-figure provenance is visible and auditable;
- no protected personal value leaves browser memory;
- sharing works without exposing protected inputs;
- direct links/routes work reliably on GitHub Pages;
- responsive/accessibility/error/empty/loading states are polished;
- production deploy and rollback are reproducible;
- Reddit feedback can be converted into traceable product work after required Human Gates.

Business metrics such as revenue, CAC, or venture-scale growth are not first-release success criteria.

## 14. Future Marketplace Mode

The prior US-first dating-marketplace design remains a possible future expansion. If activated, it must be treated as a separate architecture/product phase with new privacy, safety, legal, identity, moderation, and backend requirements rather than quietly added to the current zero-backend product.
