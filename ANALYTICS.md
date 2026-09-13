# INYEON Analytics & Experimentation

Status: measurement source of truth for alpha and city beta.

## 1. Measurement philosophy

The product should optimize for successful human connections, not swipe volume or time spent.

North-star:

> **Meaningful Connections per 100 Verified Weekly Active Users**

Initial operational definition:

`mutual match + both users message + conversation reaches >= 6 reciprocal messages`

Later quality definition:

`reported date + optional desire-to-see-again`

Compatibility analytics must distinguish **presentation effect** from **matching effect**.

## 2. Core questions

1. Does Gung-hap context improve reciprocal conversations?
2. Does bounded Saju ranking improve downstream outcomes beyond explanation-only?
3. Does K-culture positioning attract users who retain and date, or only curiosity clicks?
4. Does birth-time uncertainty materially affect onboarding or trust?
5. Does Inyeon Match scarcity improve attention without reducing marketplace breadth?
6. Does Couple Mode create a durable post-match lifecycle?
7. Are exposure, match, reply, safety, or subscription outcomes materially worse for supported identity cohorts?
8. Can one metro maintain sufficient liquidity before expansion?

## 3. KPI tree

### Marketplace

- verified WAU / MAU by metro, orientation, intent, age cohort;
- eligible candidates per active user;
- candidate concentration / repeated exposure;
- supply-demand imbalance by cohort;
- median time to first viable recommendation.

### Activation

- account started → account created;
- age gate passed;
- profile started → profile completed;
- birth step started → chart created;
- first discovery impression;
- first Like;
- first match;
- time to first meaningful connection.

### Compatibility

- compatibility card view rate;
- “Why this?” open rate;
- traditional logic open rate;
- Gung-hap full-report completion;
- conversation-prompt copy/use rate;
- resonance/feedback signal where explicitly collected.

### Inyeon Match

- impression → open;
- open → Like;
- Like → mutual match;
- match → reciprocal chat;
- conversation depth;
- report/block/unmatch guardrails.

### Conversation / dates

- match → first message;
- first message → reply;
- reciprocal chat;
- six-message conversation;
- reported date;
- second-date intent;
- ghosting proxy;
- unmatch before first response.

### Retention

- D1 / D7 / D30;
- 8-week retention;
- retained verified WAU;
- successful-match churn versus Couple Mode conversion.

### Revenue

- paywall view → purchase;
- free → paid;
- trial → paid if trials are used;
- MRR / ARR;
- ARPPU;
- monthly subscription churn;
- annual renewal;
- entitlement restore/cancel/refund rates;
- Couple Pass conversion.

### Safety

- reports per 1k conversations;
- blocks per 1k conversations;
- scam/fraud prevalence;
- impersonation/catfish reports;
- underage flags;
- moderation queue aging;
- SLA by severity;
- verification completion and failure reasons;
- safety incident rate by acquisition channel/event.

### Fairness

At minimum evaluate exposure, match, reply, moderation, verification, and monetization outcomes across supported identity cohorts when legally and ethically appropriate.

Do not infer sensitive identities from Saju.

## 4. Event taxonomy

Never include raw DOB, birth time, exact coordinates, private message text, government IDs, verification images, or secret compatibility rule inputs that could re-identify a user.

Approved starting event names:

```text
account_started
account_created
age_gate_passed

profile_started
profile_completed
photo_added

verification_started
verification_completed

birth_step_viewed
birth_date_entered
birth_time_precision_set
birth_place_resolved
chart_created
chart_methodology_opened

discovery_impression
profile_opened
compatibility_card_viewed
compatibility_why_opened
traditional_logic_opened

like_sent
pass_sent
match_created

inyeon_impression
inyeon_opened
inyeon_like_sent
inyeon_skipped

gunghap_summary_viewed
gunghap_full_viewed
gunghap_prompt_copied

message_thread_opened
first_message_sent
first_reply_received
conversation_6way_reached

we_met_prompted
we_met_yes
second_date_interest_yes

couple_invite_sent
couple_invite_accepted
couple_mode_opened
couple_checkin_completed
couple_mode_revoked

report_started
report_submitted
user_blocked
user_unmatched

paywall_viewed
subscription_started
subscription_renewed
subscription_cancelled

share_card_created
invite_sent
invite_signup_completed

privacy_center_opened
data_export_requested
account_delete_requested
account_deleted
```

## 5. Event property governance

Every event property must be classified before use.

Allowed examples:

- pseudonymous user ID;
- metro bucket;
- age band, not DOB;
- relationship-intent enum;
- birth-time precision enum `exact|approximate|unknown`;
- chart methodology version;
- compatibility rule-set version;
- experiment ID/variant;
- app version;
- device/platform class;
- non-sensitive acquisition channel;
- verification status enum.

Restricted or prohibited in general analytics:

- exact DOB/time;
- exact birthplace;
- exact GPS;
- orientation unless explicitly approved for a fairness/product purpose and access-restricted;
- message text;
- photo/image contents;
- report free text;
- raw verification vendor payloads;
- LLM prompt payloads containing personal data.

## 6. Experiment contract

Every experiment must declare:

```yaml
hypothesis:
primary_metric:
secondary_metrics:
safety_guardrails:
fairness_guardrails:
minimum_sample:
maximum_duration:
stopping_rule:
owner:
assignment_unit:
exposure_event:
analysis_plan:
```

Requirements:

- randomize at the user level for matching/product experiments unless another unit is justified;
- persist assignment long enough to observe downstream conversations;
- monitor sample-ratio mismatch;
- inspect cohort imbalance;
- predeclare safety/fairness stop conditions;
- do not ship a result solely because Likes increased.

## 7. Critical three-arm experiment

Primary hypothesis:

> Gung-hap produces better downstream dating outcomes than a normal marketplace baseline.

Arms:

- **A — baseline ranking, no compatibility explanation**;
- **B — baseline ranking + compatibility explanation**;
- **C — baseline ranking + bounded Saju ranking feature + explanation**.

Primary funnel:

`mutual match → reciprocal conversation → 6-message conversation → reported date → want-to-see-again`

Interpretation:

- B > A but C ~= B: strong **presentation/context effect**, weak evidence that Saju ranking adds value.
- C > B on downstream outcomes with guardrails stable: evidence that bounded compatibility features improve product outcomes in this marketplace.
- Likes increase but downstream conversation/date quality does not: treat as novelty effect, not matching success.

This experiment must never be described as proving metaphysical causation.

## 8. High-value product experiments

| Experiment | Primary metric | Guardrail |
|---|---|---|
| Compatibility card vs none | reciprocal conversation | report/block rate |
| “Inyeon” vs plain “Korean compatibility” | qualified activation | comprehension/trust |
| Daily vs 3/week Inyeon | Inyeon→conversation | D7 retention |
| Explanation before vs after full profile/photo review | conversation quality | Like rate / complaints |
| Balanced “clicks + watch for” vs positive-only | report completion/trust | match conversion |
| Date question vs none | first reply / depth | unmatch |
| Birth-time reassurance variants | chart completion | bad/misreported input |
| Gung-hap ranking weight 0/low/medium | meaningful connections | fairness/exposure |
| Full report at match vs after 5 messages | conversation depth | report use |
| Couple invite day 14/30/60 | Couple activation | unmatch/uninstall |
| Share card vs none | referral K-factor | privacy complaints |

Do not A/B test deceptive certainty such as “soulmate” claims.

## 9. Dashboard set

### Executive / weekly

- Meaningful Connections / 100 verified WAU;
- verified WAU by metro;
- eligible pool health;
- D7/D30 retention;
- report/block/scam rates;
- paid conversion/churn;
- experiment health;
- top fairness exceptions.

### Marketplace operations

- supply and demand by cohort;
- exposure concentration;
- recommendation exhaustion;
- time to match/conversation;
- verification coverage.

### Trust & Safety

- incoming cases by severity/category;
- backlog age;
- SLA breach rate;
- repeat offenders;
- scam cluster indicators;
- appeal/escalation outcomes.

### Product funnel

- onboarding step conversion;
- discovery/open/Like/match;
- chat depth;
- Inyeon funnel;
- full-report usage;
- Couple funnel.

### Revenue

- paywall funnel;
- MRR/ARR;
- ARPPU;
- renewal/churn;
- refunds;
- plan mix.

## 10. Attribution / acquisition

Track:

- creator/campaign ID;
- community/event ID;
- paid channel/campaign;
- referral invite source;
- organic/brand/direct.

Never include private profile content in marketing attribution systems.

For each channel compare:

- verified activation;
- D7/D30 retention;
- meaningful-connection rate;
- report/block rate;
- paid conversion;
- CAC to verified active user, not just signup CAC.

## 11. Data quality

Required checks:

- event schema validation;
- duplicate-event detection;
- idempotent server events for match/subscription/delete flows;
- client/server reconciliation for critical funnel events;
- sample-ratio mismatch alerts;
- null/unknown semantics documented;
- analytics versioning tied to app/API release where material.

## 12. Privacy-safe architecture

Recommended pipeline:

`product services → event schema validator → PII scrubber → event collector → warehouse → restricted BI`

Separate:

- operational DB;
- sensitive birth vault;
- moderation evidence;
- analytics warehouse.

Use least privilege. Analysts should not need raw private messages or birth inputs.

## 13. Decision rules

Do not scale acquisition because top-of-funnel metrics look good if:

- eligible candidate density is weak;
- reciprocal conversation is flat/down;
- report/block/scam rates worsen;
- key cohorts get materially worse exposure;
- moderation backlog exceeds SLA;
- retention is novelty-driven and collapses after week 1.

Second-city expansion requires local liquidity, safety, and retention evidence—not just MAU growth.
