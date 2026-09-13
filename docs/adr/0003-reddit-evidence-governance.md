# ADR 0003 — Evidence-Governed Reddit Product Learning

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON / Jongtae
- Builds on: ADR 0002 — Maximum Practical Reddit Autonomy

## Context

INYEON grants Codex broad practical autonomy to operate Reddit. That creates a second problem: the same agent that writes/promotes a campaign should not be the sole judge of whether the campaign succeeded or what the product should change.

Reddit feedback is useful but self-selected, community-specific, noisy, and often mixes symptoms, suggested solutions, jokes, pile-ons, and actual reproducible defects. Upvotes measure community reaction, not necessarily durable product value. A growth operator can also become biased toward interpreting its own work positively.

The project therefore needs an explicit separation between distribution, evidence interpretation, product judgment, and implementation.

## Decision

Adopt the following independent roles:

1. **Reddit Operator** — runs community experiments and exports raw evidence; does not judge its own campaign.
2. **Feedback Analyst** — independently clusters and interprets raw evidence, preserves contradictory signals, and identifies alternative explanations/source bias.
3. **Product Judge** — preregisters experiment questions and decides `IGNORE | OBSERVE | EXPERIMENT | ACT` after reviewing evidence.
4. **Worker / QA / reviewers** — implement and independently verify approved changes through normal release governance.

The roles should run in separate agent contexts when practical.

## Required process

### Before posting

The Product Judge preregisters:

- the narrow question;
- whether it is acquisition/product/trust/methodology/etc.;
- expected evidence;
- failure/inconclusive conditions;
- what result would *not* justify a product change;
- observation window.

### After posting

The Reddit Operator hands off raw evidence and operational metadata, not a persuasive success/failure conclusion.

The Feedback Analyst evaluates evidence quality using specificity, independence, repetition, source diversity, reproducibility, impact, confidence, alternative explanations, and source specificity.

The Product Judge then makes one decision:

- `IGNORE`
- `OBSERVE`
- `EXPERIMENT`
- `ACT`

Before `EXPERIMENT` or `ACT`, the judge must state strongest evidence for/against, plausible alternative explanations, sample/source bias, downside risk, the smallest reversible intervention, and verification window.

## Key invariants

### Reddit is directional evidence

Do not generalize subreddit feedback to the full US or global market without independent evidence.

### Acquisition truth != product truth

A post angle that generates more clicks/upvotes is evidence about acquisition performance, not automatically about long-term core product value.

### User solution != user problem

A request like `remove birth time` is not itself a requirement. First identify the observed problem and plausible causes, then prefer a small reversible test.

### Automation is risk-based

Low-risk reversible defects may move automatically through issue → implementation → CI → QA → release when evidence is strong/reproducible.

High-risk changes—Saju methodology, privacy/security, data collection, backend/account architecture, scientific/public claims, major product scope—must not be auto-adopted because Reddit requests are numerous.

### Saju methodology firewall

Reddit can trigger a methodology investigation but cannot directly change Four Pillars/Gung-hap rules. Disputes require reference checks, differential implementation comparison, golden fixtures, and expert/owner review when necessary.

### Decision history is durable memory

Material decisions from external feedback must be written to the Decision Ledger under `docs/decisions/` (or successor location), including sources, contradictory evidence, alternatives, decision, rejected actions, review window, and later result.

### Cooldown prevents reactionary development

Noncritical UX/product feedback should normally use a 24–72 hour evidence window, then analysis, batched decision/change, release, and observation. Critical reproducible defects/privacy-security issues may bypass cooldown.

## Model/agent strategy

Recommended defaults:

- `reddit-operator`: GPT-5.6 Terra, medium reasoning;
- `feedback-analyst`: GPT-5.6 Terra, high reasoning;
- `product-judge`: GPT-5.6 Sol, high reasoning;
- implementation: existing worker/fast-worker according to complexity;
- independent verification: QA/security reviewer as applicable.

The Product Judge receives the highest reasoning budget because bad product interpretation is more expensive than post drafting.

## Consequences

Benefits:

- reduces campaign-owner/self-confirmation bias;
- prevents Reddit popularity from becoming product truth;
- creates traceable product learning;
- preserves contradictory evidence;
- enables high autonomy without uncontrolled product thrash;
- makes Codex behave more like a small evidence-driven product organization.

Costs:

- more handoff/state artifacts;
- slightly slower noncritical product iteration;
- requires maintaining experiment and decision records;
- agent separation consumes additional model work.

These costs are accepted because INYEON optimizes for a high-quality public release and trustworthy autonomous iteration, not maximum change velocity.

## Operational source of truth

- `docs/REDDIT_EXPERIMENT_GOVERNANCE.md`
- `.codex/agents/reddit-operator.toml`
- `.codex/agents/feedback-analyst.toml`
- `.codex/agents/product-judge.toml`
- GitHub Issue #51
- `docs/HUMAN_GATES.md`

ADR 0002 grants the autonomy to operate Reddit; ADR 0003 governs how resulting evidence may change the product.
