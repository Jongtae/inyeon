# INYEON Product Requirements Document

Status: working product source of truth
Research basis: September 2026 synthesis

## 1. Product thesis

**INYEON — Dating through the Korean idea of connection.**

INYEON is a US-first dating marketplace that uses Korean Saju (사주), Gung-hap (궁합), and Inyeon (인연) as an explainable relationship-compatibility layer.

The product is **dating first, Saju second**. Real-world mutual preferences, location, age, relationship intent, safety rules, blocks, and eligibility create the candidate set. Gung-hap may explain and boundedly re-rank eligible candidates; it must never make an otherwise ineligible or unsafe person eligible.

Signature question:

> **Why might we work?**

Not:

> How compatible are we on a 0–100 scale?

Do not present Saju or Gung-hap as scientifically validated predictors of relationship success.

## 2. Why now

The category is mature but still commercially large. The differentiated opportunity is not simply “astrology dating”; Western astrology features are already being productized by major incumbents. The wedge is the combination of:

1. authentic Korean cultural vocabulary;
2. deterministic, versioned Four Pillars calculation;
3. transparent relationship explanations;
4. a real dating marketplace rather than horoscope content alone;
5. downstream outcome learning from conversations/dates;
6. Couple Mode so the product remains useful after a successful match.

INYEON sits between intentional dating products such as Hinge, broad discovery products such as Tinder, and relationship/self-reflection products such as The Pattern, Co–Star, and CHANI.

## 3. Initial target customer

Primary US launch audience:

- age 23–38 as the initial acquisition focus, while the service itself remains 18+;
- relationship-oriented rather than purely swipe-volume driven;
- culturally curious and K-culture adjacent;
- explicitly LGBTQ+ inclusive;
- one dense metro first, not nationwide.

Priority personas:

- **K-Culture Native** — already consumes Korean music, drama, food, beauty, language, or culture.
- **Astrology-Curious Dater** — comfortable using symbolic systems for reflection without requiring literal belief.
- **Intentional Dater** — wants fewer, better-explained introductions.
- **Korean-American / Diaspora User** — culturally familiar and important for authenticity feedback.
- **Compatibility Skeptic** — wants transparent logic, limitations, and evidence rather than Barnum-style copy.
- **Existing Couple** — post-match lifecycle through Couple Mode.

Do not build only for Korean-Americans. The product should expose a Korean cultural lens to a broader US audience while treating Korean/Korean-American users as credibility-critical early adopters.

## 4. Jobs to be done

### Functional

- Help me find people who already satisfy my actual dating constraints.
- Help me understand why a specific person may feel easy, difficult, complementary, or interesting.
- Give me a concrete question to ask instead of generic horoscope prose.
- Let me continue using the product after a relationship begins.

### Emotional

- Reduce superficial swipe fatigue.
- Make dating feel more intentional and narratively meaningful.
- Give culturally interesting context without pretending destiny is measurable.

### Trust

- Show how an interpretation was derived.
- Tell me when missing birth information lowers confidence.
- Never hide a person or make a safety judgment because of astrology.

## 5. Product principles

1. Dating first, Saju second.
2. Compatibility is context, not destiny.
3. No public soulmate percentage, stars, or pseudo-scientific probability.
4. Safety and mutual eligibility override all compatibility features.
5. LGBTQ+, trans, and nonbinary users are first-class users.
6. Traditional gender-role logic is not copied into modern matching.
7. LLMs explain deterministic evidence; they never calculate Saju.
8. Unknown birth time remains unknown and degrades gracefully.
9. English explains meaning; Korean terminology explains cultural origin.
10. Privacy-sensitive inputs are minimized, segregated, and never made public by default.

## 6. Core user journeys

### 6.1 Onboarding

Sequence:

`18+ → account → relationship intent → mutual preferences → profile → birth details → chart generated → discovery`

Birth inputs:

- birth date: required;
- birth time: exact / approximate / unknown;
- birthplace: required to resolve historical timezone/calendrical inputs;
- raw birth time and birthplace are private and not shown publicly.

If time is unknown, tell the user that the chart can still be built but hour-dependent interpretations will be unavailable or lower-confidence.

### 6.2 Discovery

A profile must remain recognizably a dating profile: photos, prompts, intent, basics first.

Compatibility appears as context:

- relationship archetype/headline;
- **What clicks**;
- **Worth watching**;
- **Question to ask**;
- **Why this?** with progressive disclosure into traditional logic.

### 6.3 Inyeon Match

A scarce curated candidate, initially one per week in free tier and configurable by experiment.

Purpose:

- create attention around a high-context introduction;
- differentiate from endless swiping;
- showcase Gung-hap explanation, not just scarcity.

### 6.4 Mutual match and chat

- Like → mutual match → chat.
- Show a basic Gung-hap card after match.
- Safety controls remain one tap away: report, block, unmatch.
- Date prompts should translate interpretation into conversation behavior.

### 6.5 Full Gung-hap report

Sections:

- what feels easy;
- where to take care;
- what could make the relationship strong;
- question to try on a date;
- evidence and methodology disclosure;
- confidence/limitations where relevant.

Never use fatalistic language such as “doomed,” “bad spouse,” “will divorce,” or moral/sexual/fertility claims.

### 6.6 Post-date feedback

After sufficient interaction, optionally ask:

- Did you meet?
- Would you like to see this person again?
- Optional private safety feedback.

Use this to evaluate product outcomes, not to claim metaphysical causation.

### 6.7 Couple Mode

Mutual opt-in only.

Capabilities:

- shared relationship themes;
- conversation/check-in prompts;
- explanation of recurring differences;
- optional cycle-based reflective content;
- revoke at any time.

Strategic purpose: retain successful relationships instead of treating churn from successful matching as inevitable.

## 7. MVP / V1 / V2 scope

### MVP — months 0–3 / private alpha

- account and 18+ gate;
- profile, photos, prompts, intent, preferences;
- birth date/place and optional birth time;
- deterministic Saju chart;
- candidate discovery;
- likes and mutual matches;
- basic messaging;
- basic Gung-hap card;
- Inyeon Match;
- report, block, unmatch;
- human moderation console/workflow;
- privacy export/delete foundation;
- event instrumentation.

### V1 — months 3–6 / pilot-city beta

- liveness/photo verification;
- full Gung-hap deep dive;
- LLM narrative layer with structured-output validation;
- post-date feedback;
- subscriptions and entitlements;
- Couple Mode;
- optional Pattern Check/backtest trust feature;
- referral/share cards;
- DSAR/privacy center;
- penetration/threat-model review.

### V2 — months 6–12 / PMF search

- outcome-informed ranking experiments;
- IRL K-culture events;
- second-city launch;
- creator/social compatibility artifacts;
- localization expansion as justified;
- advanced Couple Mode.

Do not put nationwide US launch on the 12-month critical path.

## 8. Compatibility product contract

Eligibility is computed before compatibility.

Recommended sequence:

`age/gender/orientation/intent → safety & block exclusions → metro/distance → activity/profile quality → candidate pool → behavioral/profile relevance → bounded Gung-hap features → diversity/repeated-exposure controls`

Compatibility must not be a universal score in the UI. Internal ranking weights may exist but must be versioned, bounded, testable, and separable from baseline profile/behavioral features.

## 9. Cultural language

User-facing first layer / deeper optional layer:

- Saju → “your Korean birth pattern” / Saju, Four Pillars;
- Gung-hap → “your relationship dynamic” / 궁합;
- Inyeon → “a meaningful connection” / 인연;
- Day Master / Five Elements / combinations/clashes are progressive disclosure.

Cultural statement:

> Korean Saju and Gung-hap are Korean practices within the broader East Asian Four Pillars tradition.

Do not claim Korea uniquely invented the whole system.

## 10. Monetization hypotheses

Pricing is an experiment, not a fact.

- **Free** — dating, messaging, core compatibility card, limited Inyeon Match.
- **Inyeon Plus** — starting hypothesis $14.99/mo or ~$89/yr; full Gung-hap, more curated matches, advanced non-sensitive filters, rewinds.
- **Inyeon Premium** — starting hypothesis $24.99/mo or ~$149/yr; deeper reports, priority curated experience, premium Couple content.
- **Gung-hap Pass** — $6.99 one-off report for two consenting/imported profiles.
- **Couple Pass** — ~$39–49/year/couple.
- **Founder Beta** — ~$59–79/year early-adopter plan.

Never monetize blocking, reporting, basic privacy controls, verification required for safety, or escape from harassment.

## 11. Launch strategy

Pilot one metro.

Provisional recommendation: **Los Angeles**, unless NYC or another city can produce materially better pre-launch density.

Launch gate: approximately **2,000 genuinely eligible, balanced, verified seeded profiles** before broad opening. Then target ~10k MAU pilot and ~50k MAU scale only after local liquidity works.

Acquisition wedge:

- Korean-American and K-culture creators with cultural credibility;
- TikTok/Reels/YouTube Shorts demonstrating Gung-hap as a conversation lens;
- K-town events and “Gung-hap Night” concepts;
- campus Korean/Asian-American organizations;
- Korean restaurants, cafés, bookstores, and cultural venues;
- dating/relationship creators.

Hero messaging:

> Maybe you do not need more matches. Maybe you need more context.

## 12. Success metrics

North-star:

> **Meaningful Connections per 100 Verified Weekly Active Users**

Initial definition:

`mutual match + both users message + conversation reaches >= 6 reciprocal messages`

Graduate toward reported date + desire-to-see-again.

Supporting metrics:

- verified MAU by metro / orientation / intent cohort;
- eligible candidates per active user;
- onboarding completion;
- first-like activation;
- Inyeon impression → profile open → like → match;
- match → first message → reply → 6-message conversation;
- D1/D7/D30/8-week retention;
- report/block/scam rates and moderation SLA;
- subscription conversion/churn/ARPPU;
- exposure/match/reply fairness by supported cohort;
- Couple Mode activation and 30/90-day retention.

## 13. Critical experiment

The highest-value product/business question is:

> **Does Gung-hap improve actual dating outcomes, or only make the product more interesting?**

Run user-level persistent assignment:

- A — baseline ranking, no compatibility explanation;
- B — baseline ranking + compatibility explanation;
- C — baseline ranking + bounded Saju feature + explanation.

Primary funnel:

`mutual match → reciprocal conversation → 6-message conversation → reported date → want-to-see-again`

This separates **presentation effect** from **matching effect**.

## 14. Falsifiable launch hypotheses

1. K-culture framing improves qualified signup without lowering trust.
2. Gung-hap explanation increases reciprocal conversation, not just Likes.
3. Bounded Saju ranking improves downstream outcomes versus explanation-only.
4. Missing birth time does not materially damage onboarding completion when uncertainty is explained well.
5. Balanced “what clicks / watch for” copy is trusted more than positive-only copy.
6. Inyeon scarcity improves attention without harming D7 retention.
7. First-date questions increase first reply or conversation depth.
8. Couple Mode creates meaningful post-match retention.
9. Share cards generate organic acquisition without privacy complaints.
10. One-city density produces materially better outcomes than thin multi-city coverage.
11. Verification improves trust enough to offset onboarding friction.
12. Korean terminology increases curiosity only when paired with plain-English meaning.

## 15. Non-goals

- National launch before local liquidity.
- “Destined soulmate” claims.
- Public compatibility percentages.
- Astrology-based safety judgments.
- Predicting fertility, morality, mental illness, infidelity, wealthworthiness, or spouse quality.
- Hidden birth-time substitution.
- Building proprietary biometric face-template infrastructure.
- Sophisticated ML before baseline marketplace and measurement work.

## 16. Human/legal gates

Before public city beta, obtain qualified counsel review for:

- US state privacy obligations and sensitive-data treatment;
- automated decision/ranking disclosures and applicable California requirements;
- biometric/photo verification vendor terms and state biometric laws;
- subscription, auto-renewal, cancellation, and refund copy;
- App Store / Google Play UGC and dating policy readiness;
- Terms, Privacy Policy, Community Guidelines, Safety Center;
- incident-response and law-enforcement request process.

Product disclaimers do not cure misleading claims; functionality and marketing must be truthful by design.
