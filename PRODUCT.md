# Product Definition

## Status

Active first-release product definition for **Independent Release Mode**.

The historical US-first dating marketplace remains a future optional expansion. For current requirements, `PRD.md`, `ARCHITECTURE.md`, `ROADMAP.md`, and this document take precedence over older marketplace assumptions.

## Positioning

**INYEON — Explore connection through the Korean idea of Inyeon.**

INYEON is a Korean Saju / Gung-hap compatibility lab first.

It answers:

> **What kind of relationship dynamic might this pairing suggest — and why?**

not:

> **What percentage soulmates are we?**

The product is an independent personal project intended for a real public release. It does not need to prove a venture business, but it must meet a production-grade release bar.

## Active first-release audience

Anyone curious about Korean Saju/Gung-hap who wants to explore relationship dynamics in a transparent, non-fatalistic way.

The first release does not require account creation, marketplace density, or a dating profile.

## Core experience

1. Enter personal birth date, optional/unknown time, and birthplace as needed.
2. Compute deterministic Saju/Four Pillars locally in the browser.
3. Show uncertainty when information is incomplete.
4. Compare with a sourced public figure.
5. Explore clearly fictional synthetic characters.
6. Optionally compare with someone the user knows.
7. Show `What clicks / Potential friction / Why this?`.
8. Share a privacy-safe result card/link.
9. Read methodology/source/privacy disclosures.

## Reference modes

### Public Figure

- real well-known public person used only as a reference example;
- public birth data must be sourced and confidence-labelled;
- unknown time stays unknown;
- no endorsement, participation, romantic-availability, or private-life implication;
- imagery must be license-aware/non-infringing.

### Synthetic Character

- deterministic fictional reference generated from versioned seeds/distributions;
- persistently labelled fictional;
- same compatibility engine as every other mode;
- never a fake member and never exposes Like/Match/Message/online/distance behavior.

### Someone I Know

- data entered by the current user for a legitimate personal comparison;
- both subjects' personal data remains in browser memory only;
- no application storage/transmission.

## UX rules

- Compatibility explanations are context, not authority.
- Traditional terms use progressive disclosure and plain-English meaning.
- Birth time may be exact, approximate, disputed, date-only, or unknown depending on subject type.
- Unknown time must never be silently substituted.
- No public numeric soulmate score.
- Negative language describes dynamics, never moral worth or inevitability.
- Do not infer violence, criminality, morality, infidelity, fertility, mental illness, sexual behavior, or inevitable marriage/divorce outcomes.
- Public/synthetic/personal entities must look and behave distinctly.
- The product should be enjoyable with one user; no marketplace cold-start dependency.

## Sharing

Default share surfaces:

- browser-generated image card;
- native Web Share where available with fallback;
- share-safe result link containing only allowlisted non-sensitive data;
- explicit `Compare with me` flow with disclosure if any derived personal representation is shared;
- stable public-figure pages/OG assets where practical.

Raw birth date/time/place is never silently included in share payloads.

## Privacy

First-release promise:

> **Personal birth and compatibility inputs are processed in the browser. INYEON application code does not collect, transmit, or store them.**

Protected values must not enter browser persistence, URLs, analytics, logs, or third-party requests.

## Hosting / release

Active runtime:

`GitHub repository → GitHub Actions → GitHub Pages → browser-only calculation`

A local demo is not Done. The release must pass golden/regression/privacy/E2E/accessibility checks and run on a real public production URL with reproducible deployment and rollback.

## Feedback loop

Reddit is the preferred initial public feedback channel after the production candidate exists.

Codex may create/configure a Reddit account and publish posts or replies when technically available, legally permitted, and community rules are clear. Stop only for CAPTCHA, email/phone/identity verification, MFA, owner-only terms acceptance or credential recovery, ambiguous community rules, or material legal/reputational risk.

Feedback may be clustered into GitHub issues. Only bounded, reversible, well-evidenced fixes may auto-enter implementation; methodology/privacy/security/major product direction remain human-reviewed.

## First-release success

Success means:

- real users can use the public product reliably;
- Saju calculation is deterministic/versioned;
- uncertainty is honest;
- public-figure data is sourced/auditable;
- synthetic characters are transparent;
- protected personal data stays in browser memory;
- sharing works without leaking protected input;
- production deployment/rollback is reproducible;
- feedback becomes traceable improvements.

Revenue, CAC, subscription conversion, or dating-marketplace liquidity are not first-release success metrics.

## Future Marketplace Mode

If explicitly activated later, real-user eligibility, profiles, discovery, likes/matches/chat, trust & safety, payments, city liquidity, and Couple Mode can be layered on with a new architecture/privacy review.
