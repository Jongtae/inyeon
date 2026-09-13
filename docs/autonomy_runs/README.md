# Autonomous Run Evidence

This directory stores compact factual evidence for L4 autonomous closed loops.

Do **not** store private chain-of-thought. Record observable actions, decisions, references, results, and owner interventions only.

## File naming

Use:

`RUN-YYYYMMDD-NN.md`

Example: `RUN-20260920-01.md`.

## Required template

```markdown
# RUN-YYYYMMDD-NN

- Start:
- End:
- Trigger:
- Goal / selected issue:
- Initial TEAM_STATE ref:
- Evidence refs:
- Roles used:
- Human Gates encountered:
- Owner intervention:
  - none | declared Human Gate | outside declared Human Gate
- Product/technical decision refs:
- Implementation refs:
- PR/commit refs:
- Release URL/SHA:
- Rollback SHA at start:

## Verification

- Unit/property tests:
- E2E:
- Privacy/security:
- QA/reviewer:
- Production smoke:
- L4 structural check:
- Behavioral evals, if relevant:

## Recovery

- Failure detected:
- Containment:
- Rollback/recovery:
- Root cause:
- Regression protection:
- Verified redeploy:

Use `not applicable` where no failure occurred; do not invent a recovery event.

## Result

- outcome:
- user/product/operational evidence:
- what changed:
- what deliberately did not change:
- new risks:
- next action:
- final TEAM_STATE ref:

## Closed-loop qualification

- [ ] real trigger/evidence existed
- [ ] work/decision was selected without routine owner direction
- [ ] applicable independent review boundary was preserved
- [ ] acceptance/release verification completed
- [ ] TEAM_STATE was updated
- [ ] any owner intervention was a declared Human Gate
- [ ] final result/learning/next state is durable

`Counts toward L4 proof: yes/no`
```

## Counting rules

A run counts as one of the five consecutive L4 proof loops only when every applicable qualification checkbox is satisfied and the final line says `yes` with evidence.

A deliberate `IGNORE` or `OBSERVE` product decision can count as a loop if it begins from real external evidence, passes the independent analysis/judgment path, creates a durable decision record, updates state, and requires no implementation. Merely reading issues or doing routine maintenance without an observe/decide/verify closure does not count by itself.

If a run needs routine owner clarification because the repository/state was insufficient, record that as intervention outside a declared Human Gate and reset the consecutive proof window after the state gap is repaired.

A genuine Human Gate does not invalidate a run if all unblocked work continues and the human action is limited to the documented gate.
