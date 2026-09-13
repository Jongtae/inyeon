# AGENTS.md

This is the durable root instruction file for Codex.

## Mission

Build, deploy, and operate INYEON as a production-capable, US-first dating and relationship service using Korean Saju / Gung-hap / Inyeon as an explainable cultural compatibility layer.

## Mandatory reading order

Before material work, read:

1. `CODEX.md`
2. `PRODUCT.md`
3. `SAJU_ENGINE_SPEC.md`
4. `MATCHING_SPEC.md`
5. `SAFETY.md`
6. `PRIVACY.md`
7. `ROADMAP.md`
8. relevant ADRs and issue context

Repository files are durable memory. Important decisions must not live only in chat context.

## Execution rule

GitHub Issues are the execution queue. Do not stop after producing a plan when the issue can be implemented.

For each issue:

`READY → inspect → implement → test → self-review → independent review when warranted → fix → CI → docs → PR → merge when gates pass → close → next issue`

A feature is not complete because code exists. Acceptance criteria and required tests must pass.

## Autonomy

Make routine product and engineering decisions yourself. Prefer the simplest reversible decision, record meaningful tradeoffs as ADRs, and continue.

Stop only when a condition in `docs/HUMAN_GATES.md` is met.

## Product invariants

- Dating first, Saju second.
- Compatibility is context, not destiny.
- No public numeric soulmate score or star rating.
- Safety, mutual preferences, legal constraints, blocks, and deal-breakers override compatibility ranking.
- Do not encode traditional husband/wife stereotypes as modern product logic.
- Inclusive relationship language is required.
- LLMs never calculate Four Pillars or invent deterministic facts.
- Unknown birth time stays unknown and suppresses or reduces confidence for hour-dependent rules.
- Never claim Saju is scientifically predictive.
- Never expose exact DOB, birth time, birthplace, sexual orientation, precise location, private messages, or verification artifacts unnecessarily.

## Engineering invariants

Maintain explicit boundaries between:

- dating/profile domain
- sensitive PII domain
- deterministic Saju engine
- compatibility rules
- ranking
- narrative/LLM service
- messaging
- trust & safety
- analytics/experimentation

Do not hide domain rules inside prompts. Store methodology, rule, prompt, and model versions needed to reproduce outputs.

## Required testing depth

At minimum maintain:

- unit tests for domain logic
- property/invariant tests for Saju calculations
- golden fixtures for calendrical boundaries
- integration tests across API/DB boundaries
- authorization and IDOR tests
- block/report/moderation tests
- privacy leak tests for logs, analytics, and LLM payloads
- E2E tests for onboarding → discovery → match → chat → report/block/delete
- migration tests and production smoke tests

## Subagent policy

Use specialist roles defined by `.codex/config.toml` when independent parallel work improves quality or speed.

- `architect`: architecture, cross-system design, difficult data model and ADRs
- `worker`: implementation and difficult debugging
- `explorer`: repository/API/docs exploration, read-heavy work
- `security-reviewer`: security/privacy/trust-safety review; prefer read-only
- `qa`: regression, edge cases, test design and failure isolation
- `fast-worker`: mechanical migrations, fixtures, docs, repetitive leaf work

Normally keep concurrent subagents <= 5. Do not parallelize tasks likely to edit the same shared modules or schema.

If the same approach fails once, a retry must add new evidence, a new hypothesis, or model/role escalation.
