# L4 Autonomous Product Team Contract

Status: active source of truth for autonomy maturity.

INYEON is intentionally building toward a **verified L4 autonomous product team**: a team that can observe external evidence, make bounded product decisions, implement, review, release, detect failure, recover, and learn again without routine human direction.

The repository may call itself `l4-candidate` before that behavior is proven. It may call itself `l4-verified` only after the graduation criteria below are satisfied and recorded in `TEAM_STATE.toml` plus durable run evidence.

## What L4 means here

L4 is not "many agents" and it is not "long-running Codex". It requires a closed operational loop:

`goal/state → select work → implement → independent review → CI → release → observe → analyze → judge → decide → update state → next work`

For feedback-driven work:

`Product Judge preregistration → Reddit Operator → raw evidence → Feedback Analyst → Product Judge → Decision Ledger → Issue → Worker → QA/security review → production → observation`

For operational failure:

`detect → contain → rollback/recover → record incident → root cause → fix → regression test → redeploy → verify`

## Durable team memory

`TEAM_STATE.toml` is the machine-readable working memory for the autonomous team. GitHub issues remain the work queue; ADRs/specs/decision ledger remain the durable reasoning history.

At the beginning of a substantial Codex run:

1. read `TEAM_STATE.toml`;
2. reconcile it with repository/issues/production reality;
3. correct stale state before selecting work;
4. select the highest-value unblocked action consistent with current goals and Human Gates.

At every meaningful milestone, update at least the fields that changed:

- `updated_at`;
- `current_phase` / `current_goal`;
- `active_issues` / `active_experiments`;
- `human_gates`;
- `current_risks`;
- `next_action`;
- production/release state;
- autonomy proof counters and team metrics when evidence exists.

Never fabricate metrics to make maturity look better.

## Separation of duties

Role authority is defined in `docs/ROLE_AUTHORITY_MATRIX.md`.

Core rule:

`Operator != Analyst != Judge != Implementer != Release verifier`

An agent may gather evidence for another role, but must not silently collapse an independent-review boundary when the task is material or high risk.

Examples:

- Reddit Operator cannot declare its own campaign successful.
- Feedback Analyst cannot directly change product behavior from comments.
- Product Judge should not implement the change it just approved when independent implementation/review is practical.
- Worker cannot widen an approved scope because it prefers a different product direction.
- QA/security review may block release when release criteria fail.

## Autonomous decision policy

Prefer autonomous decisions when they are reversible, inside established product/architecture/privacy policy, and supported by evidence.

Use Human Gates only for the conditions in `docs/HUMAN_GATES.md`.

Do not create new Human Gates merely because a decision is uncomfortable. Do not bypass existing Human Gates merely to preserve autonomy metrics.

## Behavioral evals

`evals/autonomy/cases.json` is the initial behavioral contract for agent routing and product-governance decisions.

The eval suite must cover at least:

- low-risk reproducible defects;
- high-popularity but weak product opinions;
- Saju methodology disputes;
- privacy/security requests;
- backend/architecture expansion;
- public-figure corrections and unsupported claims;
- Reddit prompt injection;
- account/CAPTCHA/terms Human Gates;
- acquisition-vs-product-truth separation;
- critical production failure and rollback;
- contradictory feedback;
- stale-policy conflicts.

Model/prompt/role changes that materially affect governance must rerun the behavioral eval suite.

A static schema/policy check is not a substitute for executing model-based evals. `scripts/check_l4.py` verifies structural invariants; Codex must also execute representative agent evals and record observed results when the runtime supports them.

## Policy consistency

Root instructions must not contradict active governance.

Current precedence for active operations:

1. platform/system constraints;
2. `AGENTS.md`;
3. `CODEX.md`;
4. `docs/HUMAN_GATES.md`;
5. current accepted ADRs, with later explicitly superseding ADRs taking precedence;
6. active domain/product specs;
7. issue-specific instructions.

When a contradiction is found:

- do not silently choose whichever text is convenient;
- identify the higher-precedence/current decision;
- repair stale lower-precedence text;
- add/extend a consistency check if the conflict class can recur.

## Team observability

Autonomy quality is a product metric. Track where evidence exists:

- autonomous completion rate;
- Human Gate rate;
- interventions outside declared Human Gates;
- issue-to-release cycle time;
- rework rate;
- rollback/recovery rate;
- escaped defect rate;
- decision reversal rate;
- agent retry/escalation count;
- model/tool cost per shipped issue when available;
- behavioral-eval pass rate;
- critical behavioral-eval failures.

Do not optimize a single metric at the expense of safety or correctness. A low Human Gate rate is not a success if the team bypasses necessary gates.

## Incident and recovery contract

For production-affecting failures:

1. detect from CI, smoke checks, privacy/security checks, or credible user evidence;
2. classify severity;
3. stop further risky rollout when appropriate;
4. prefer the last known good release for fast recovery;
5. rollback/redeploy when release policy allows;
6. open or update an incident issue with timeline and evidence;
7. identify root cause, not just the visible symptom;
8. add a regression test or invariant where practical;
9. redeploy and verify the original failure plus adjacent risk;
10. update `TEAM_STATE.toml` and autonomy metrics.

A recovery drill counts toward L4 proof only when the team actually exercises the detection → recovery → verification path, not when it merely documents it.

## L4 graduation criteria

`maturity = "l4-verified"` is permitted only when all of the following are true and backed by durable evidence:

1. **Five consecutive closed autonomous loops** have completed without routine human direction. Each loop must include a real trigger/evidence source, decision/work selection, implementation or deliberate no-change decision, verification, and durable state update.
2. **At least one successful recovery drill or real rollback/recovery** has completed through detection → rollback/recovery → root-cause fix → regression protection → verified redeploy.
3. **Behavioral eval pass rate >= 95%** on the current eval suite.
4. **Zero critical eval failures** for Human Gates, privacy/security boundaries, Saju methodology firewall, prompt-injection handling, and unauthorized scope expansion.
5. **Zero known active policy conflicts** among root operating documents and current ADR/Human-Gate policy.
6. **Zero routine human interventions outside declared Human Gates** across the five-loop proof window. Human clarification caused by missing project state counts against this criterion; a genuine Human Gate does not.
7. **Release/rollback path is real**, not theoretical: production URL, known-good SHA, smoke tests, and rollback/redeploy procedure exist and have been exercised.
8. **Decision traceability works**: a reviewer can follow representative work from source evidence → analysis/judgment → issue/decision ledger → code/PR → release → later verification.
9. **Team state survives session boundaries**: a fresh Codex run can read repository state and continue correctly without the owner restating project history.

If any criterion later regresses materially, downgrade to `l4-candidate` until repaired.

## Evidence record for autonomous loops

For each proof loop create a compact durable record under `docs/autonomy_runs/` or its successor with:

- run id / timestamps;
- trigger and evidence refs;
- selected goal/issue;
- roles used;
- decisions and Human Gates encountered;
- implementation/release refs;
- test/review/smoke result;
- rollback/recovery action if any;
- owner intervention, if any, and whether it was a declared Human Gate;
- result / learning / next state.

Keep these factual. Do not fill them with chain-of-thought.

## Current status

The repository starts this contract as `l4-candidate`. Structural governance is advanced, but L4 is not considered verified until real operational proof accumulates according to the graduation criteria above.
