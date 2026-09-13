# INYEON — US-first Korean Compatibility Dating

**INYEON — Dating through the Korean idea of connection.**

INYEON is a US-first dating marketplace that uses Korean Saju (사주), Gung-hap (궁합), and Inyeon (인연) as an explainable cultural compatibility layer.

> **Dating first, Saju second.**
>
> Real-world mutual preferences, safety, location, intent, and eligibility define who can meet. Gung-hap explains and may boundedly re-rank already eligible candidates; it never overrides safety or eligibility.

This repository is designed for long-running, issue-driven Codex execution from product research through production operations.

> **Plan only enough to execute safely; then keep shipping verified increments until a real Human Gate is reached.**

## Current status

The research-backed business/product/technical blueprint is now in the repository and the executable GitHub backlog contains **48 issues**, including the initial bootstrap issue.

The application implementation is the next phase. Start from GitHub Issue #1, reconcile rather than duplicate the existing backlog, establish the monorepo/ADRs, and then move directly into the highest-priority unblocked P0 issue.

## Start here

1. Read `AGENTS.md` and `CODEX.md`.
2. Read `PRD.md`, `BUSINESS.md`, `ARCHITECTURE.md`, `OPERATIONS.md`, and `ANALYTICS.md`.
3. Review `PRODUCT.md`, `SAJU_ENGINE_SPEC.md`, `MATCHING_SPEC.md`, `SAFETY.md`, `PRIVACY.md`, `ROADMAP.md`, and `BACKLOG.md`.
4. Review `docs/HUMAN_GATES.md` and relevant ADRs.
5. Validate `.codex/config.toml` and run `scripts/check_harness.py`.
6. Start with GitHub Issue #1. Do not create a second competing backlog.
7. After bootstrap, normal continuation should use `prompts/CONTINUE.md`.

Recommended first Codex instruction:

```text
Read AGENTS.md, CODEX.md, PRD.md, ARCHITECTURE.md, ROADMAP.md and BACKLOG.md.
Start GitHub issue #1 end-to-end.
The research-backed backlog already exists; reconcile and refine it rather than recreating it.
After #1 establishes the repo/ADR/toolchain skeleton, continue with the highest-priority
unblocked P0 issue until a defined Human Gate is reached.
```

## Durable source-of-truth documents

| Document | Purpose |
|---|---|
| `PRD.md` | research-backed product requirements, ICP, journeys, MVP/V1/V2, hypotheses |
| `BUSINESS.md` | market-entry thesis, GTM, cold start, monetization, financial scenarios, failure modes |
| `ARCHITECTURE.md` | target system/data/service boundaries, API model, security and testing architecture |
| `SAJU_ENGINE_SPEC.md` | deterministic Four Pillars/Saju methodology requirements |
| `MATCHING_SPEC.md` | eligibility-first matching and compatibility constraints |
| `SAFETY.md` | dating safety invariants |
| `PRIVACY.md` | privacy principles and sensitive-data boundaries |
| `OPERATIONS.md` | launch stages, Trust & Safety operations, incidents, SLOs, team rhythm |
| `ANALYTICS.md` | north star, event taxonomy, dashboards, experimentation and fairness |
| `ROADMAP.md` | milestone gates M0–M6 and critical path |
| `BACKLOG.md` | epic/milestone map and issue execution guide; GitHub Issues remain authoritative |
| `CODEX.md` | autonomous engineering/release operating contract |
| `AGENTS.md` | durable Codex project instructions |

## Product invariants

- Dating first, Saju second.
- Compatibility is context, not destiny.
- No public soulmate percentage, star score, or pseudo-scientific probability.
- Mutual preferences, account eligibility, blocks, and safety constraints override astrology.
- LGBTQ+, trans, and nonbinary users are first-class users.
- Traditional husband/wife stereotypes are not product matching logic.
- LLMs explain deterministic facts; they do not calculate Saju.
- Missing birth time degrades gracefully; never invent one.
- Sensitive birth, orientation/preference, location, message, moderation, and verification data is minimized and segregated.
- Safety overrides engagement.
- Do not make scientific predictive claims for Saju / Gung-hap.
- Korean Saju/Gung-hap is described as Korean practice within the broader East Asian Four Pillars tradition.

## Core product question

The key falsifiable business/product hypothesis is:

> **Does Gung-hap improve real dating outcomes, or only make the product more interesting?**

The critical experiment therefore preserves three arms:

- A — baseline ranking, no compatibility explanation;
- B — baseline ranking + compatibility explanation;
- C — baseline ranking + bounded Saju feature + explanation.

The initial north-star proxy is **Meaningful Connections per 100 Verified Weekly Active Users**: mutual match + both users message + at least six reciprocal messages, graduating later toward reported date + desire-to-see-again.

## Launch strategy

Launch one US metro first. Los Angeles is provisional, with NYC as the main comparison candidate. The city decision is governed by a scorecard and a supply/liquidity gate, not brand preference.

A working broad-launch gate is approximately **2,000 genuinely eligible, balanced, verified profiles** with healthy eligible-candidate depth across meaningful orientation/intent cohorts. Do not launch a second thin marketplace before the first one works.

## Codex model strategy

The harness uses a two-tier default:

- `gpt-5.6-sol` for architecture, security/privacy, difficult implementation, core Saju logic, and release arbitration.
- `gpt-5.6-terra` for exploration, QA, regression review, code review, and bounded implementation work.

If the installed Codex environment exposes a reliable lower-cost model for mechanical leaf work, `fast-worker` may be adjusted after a smoke test. Do not assume role/model routing works until the harness and a real subagent smoke test succeed.

## Human gates

Codex should stop only for actual external/irreversible gates such as:

- accepting contracts or legal terms;
- qualified legal approval;
- domain/App Store/Play account commitments;
- material unbounded spend;
- production destructive data operations;
- unavailable production credentials;
- serious Trust & Safety judgments requiring an accountable human;
- a material unresolved privacy/safety risk.

Everything else should continue autonomously when reversible and within repository governance. See `docs/HUMAN_GATES.md`.
