# INYEON — Codex Operating Harness

US-first dating product using Korean Saju / Gung-hap / Inyeon as an explainable compatibility layer.

This repository bootstrap is designed for long-running, issue-driven Codex execution. The operating principle is simple:

> **Plan only enough to execute safely; then keep shipping verified increments until a real human gate is reached.**

## Start here

1. Read `AGENTS.md` and `CODEX.md`.
2. Review `PRODUCT.md`, `SAJU_ENGINE_SPEC.md`, `MATCHING_SPEC.md`, `SAFETY.md`, `PRIVACY.md`, and `ROADMAP.md`.
3. Copy or merge `.codex/config.toml` into the project Codex configuration you actually use.
4. Start Codex with the contents of `prompts/MASTER_PROMPT.md`.
5. After bootstrap, normal continuation should use `prompts/CONTINUE.md`.

## Product invariants

- Dating first, Saju second.
- Compatibility is context, not destiny.
- No public soulmate percentage or star score.
- Mutual preferences and safety constraints override astrology.
- LGBTQ+ and nonbinary users are first-class users.
- LLMs explain deterministic facts; they do not calculate Saju.
- Missing birth time degrades gracefully; never invent one.
- Sensitive birth, orientation, location, and message data is minimized and segregated.
- Safety overrides engagement.
- Do not make scientific claims for Saju / Gung-hap.

## Repository status

This bootstrap intentionally contains governance and execution scaffolding, not application implementation. Codex should create the implementation monorepo structure and backlog after reading the product specifications.

## Codex model strategy

The harness uses a two-tier default that is robust in current Codex setups:

- `gpt-5.6-sol` for architecture, security, difficult implementation, and release arbitration.
- `gpt-5.6-terra` for exploration, QA, code review, repetitive-but-nontrivial work, and default subagents.

If your Codex installation exposes `gpt-5.6-luna` reliably, `fast-worker` may be moved to Luna after a smoke test. Do not assume per-role model routing works until `scripts/check_harness.py` and a real subagent smoke test succeed.

## Human gates

Codex should stop only for an actual gate such as irreversible production deletion, external contracts, legal acceptance, unavailable credentials, new material spend, or a material privacy/safety uncertainty. See `docs/HUMAN_GATES.md`.
