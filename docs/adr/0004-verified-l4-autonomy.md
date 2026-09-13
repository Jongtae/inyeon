# ADR 0004 — Verified L4 Autonomous Product Team

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON / Jongtae

## Context

INYEON already has a mature Codex harness, issue-driven implementation, specialist agents, Human Gates, production-release requirements, Reddit operating autonomy, and independent feedback-analysis/product-judgment roles.

However, a well-written multi-agent harness is not sufficient evidence that the product team is actually autonomous. The owner wants the project to become a **complete L4 autonomous product team**, meaning it can repeatedly move from goal/evidence to decision, implementation, release, observation, recovery, and learning without routine human coordination.

The missing capabilities were primarily persistent working state, explicit separation of authority, behavioral governance evals, team-level observability, policy-conflict detection, operational proof records, and a falsifiable graduation standard.

## Decision

INYEON adopts `docs/AUTONOMY_L4.md` as the active autonomy maturity contract.

The project begins as:

`maturity = "l4-candidate"`

in `TEAM_STATE.toml`.

It may transition to:

`maturity = "l4-verified"`

only after all graduation criteria in that contract are satisfied with durable evidence.

## Core mechanisms

### Persistent team state

`TEAM_STATE.toml` is the machine-readable working memory for goal, phase, active work, Human Gates, risks, release state, next action, team metrics, and L4 proof counters.

Fresh Codex sessions must reconcile this state with actual repository/issues/production reality before material work.

### Separation of duties

`docs/ROLE_AUTHORITY_MATRIX.md` defines authority and prevents silent collapse of:

`Operator → Analyst → Judge → Implementer → Release Verifier`.

### Behavioral governance evals

`evals/autonomy/cases.json` defines expected routing/decisions for representative autonomy scenarios. Structural validation lives in `scripts/check_l4.py`; model/role behavior must also be evaluated when runtime tooling permits.

### CI policy consistency

The harness workflow runs both:

- `scripts/check_harness.py`
- `scripts/check_l4.py`

so stale policy conflicts or missing L4 operating assets fail the governance check.

### Operational evidence

Qualified autonomous loops are recorded under `docs/autonomy_runs/`. Decision history remains under `docs/decisions/`.

### Failure recovery

L4 proof requires at least one exercised detection → containment → rollback/recovery → root-cause → regression-protection → redeploy → verification path.

## Graduation standard

The exact current standard is owned by `docs/AUTONOMY_L4.md`, including at minimum:

- five consecutive closed autonomous loops;
- at least one successful real recovery drill/path;
- behavioral eval pass rate >= 95%;
- zero critical eval failures;
- zero active policy conflicts;
- zero routine owner interventions outside declared Human Gates during the proof window;
- real production and rollback state;
- end-to-end decision/release traceability;
- successful continuation from a fresh session using repository state alone.

## Non-goals

- Do not maximize autonomy by bypassing legitimate Human Gates.
- Do not add agents solely to increase perceived sophistication.
- Do not declare L4 from documentation completeness alone.
- Do not fabricate team metrics or closed-loop evidence.
- Do not make production safety subordinate to autonomy rate.

## Consequences

### Benefits

- autonomous work can survive session boundaries;
- maturity becomes falsifiable rather than rhetorical;
- model/prompt regressions have a behavioral test target;
- product-learning roles have explicit authority boundaries;
- stale governance conflicts can become CI failures;
- production recovery is part of the autonomy definition;
- the owner can evaluate autonomy quality using evidence rather than time spent by Codex.

### Costs

- agents must update durable state and evidence records;
- governance changes require maintenance of eval fixtures/checks;
- L4 verification intentionally takes real operational cycles rather than a one-time configuration change.

These costs are accepted because the project's goal is a reliable autonomous product team rather than merely an autonomous coding demo.
