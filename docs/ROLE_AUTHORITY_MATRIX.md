# Role Authority Matrix

Status: active governance for autonomous execution.

The goal is to preserve useful independence between product operation, evidence interpretation, product judgment, implementation, and release verification.

## Matrix

| Role | May do autonomously | Must not do unilaterally | Escalates to |
| --- | --- | --- | --- |
| `architect` | architecture within approved product/privacy boundaries, ADRs, interfaces, migrations within active mode | introduce backend/persistent personal data when current architecture forbids it; override Human Gates | owner/Human Gate, security reviewer |
| `worker` | implement approved/refined issues, tests, docs, PRs, bounded refactors | expand product scope or methodology beyond issue/decision; weaken tests/privacy to make CI pass | architect, product judge, security reviewer, QA |
| `fast-worker` | mechanical low-risk changes, fixtures, docs, isolated cleanup | make product/methodology/privacy decisions | worker/architect |
| `explorer` | gather code/API/library/source evidence, compare options | mutate production/product policy from findings alone | architect/product judge |
| `security-reviewer` | inspect security/privacy/release risk, block release on defined critical failures | silently change product direction or implement feature scope | architect/worker/owner for Human Gates |
| `qa` | design/run regression/E2E/release checks, reject a release candidate that fails acceptance/release criteria | redefine requirements merely to pass tests | worker/architect/product judge |
| `reddit-operator` | subreddit research, transparent posting/replies, timing, monitoring, raw-evidence handoff when rules/tools permit | judge own campaign success; directly change product based on feedback; spam, astroturf, bypass controls | feedback analyst, Human Gate when required |
| `feedback-analyst` | cluster raw evidence, preserve contradictions, assess source bias/root causes, recommend routing | implement product changes; convert user-requested solution into requirement without analysis; modify Saju methodology | product judge / methodology review |
| `product-judge` | preregister experiments, issue `IGNORE/OBSERVE/EXPERIMENT/ACT`, create decision records/issues, choose smallest reversible test | implement its own high-impact decision when independent implementation/review is practical; bypass Human Gates; declare Reddit representative of the market | worker/architect/security/owner as appropriate |

## Mandatory separation

For material feedback-driven changes, preserve this sequence whenever practical:

`Operator → raw evidence → Analyst → Judge → Issue/Decision → Worker → QA/Security → Release`

The same model family may serve multiple roles, but use separate subagent contexts and do not pass persuasive self-evaluation from one role into the next.

## Release vetoes

The following roles may block release until their defined failure is resolved:

- `qa`: failing required acceptance/regression/E2E/release checks;
- `security-reviewer`: critical security/privacy/secret leakage or an unresolved prohibited-data path;
- `architect`: architecture invariant violation or unsafe irreversible migration;
- `product-judge`: feedback-driven implementation materially exceeds the approved decision or experiment scope.

A veto must cite a concrete invariant, acceptance criterion, test, or current governance rule. Veto authority is not permission to redesign unrelated scope.

## Change classes

### Class A — bounded autonomous

Examples: reproducible bug, copy typo, responsive defect, accessibility issue, verified public-figure correction, deterministic regression.

Normal path: issue → worker → tests → QA/review → release.

### Class B — autonomous experiment, governed decision

Examples: onboarding explanation, result-card copy, celebrity acquisition hook, navigation structure, non-sensitive share UX.

Normal path: preregistration → experiment → independent analysis/judgment → bounded reversible change → observation.

### Class C — Human Gate / high risk

Examples: backend introduction, persistent personal data, new sensitive analytics, unresolved Saju methodology conflict, legal/public claims with material risk, contracts/spend beyond approved limits, owner-only identity/terms/security steps.

Normal path: prepare everything possible → stop at smallest human-only action → resume autonomously after completion.

## Scope expansion rule

No implementation agent may silently turn an issue into a broader product initiative. If implementation reveals a larger opportunity:

1. finish or safely pause the bounded work;
2. record the evidence;
3. create/refine a separate issue or decision proposal;
4. route material product changes through Product Judge and applicable Human Gates.

## Conflict rule

If role instructions conflict, prefer the higher-precedence repository governance defined in `docs/AUTONOMY_L4.md`, then repair the stale role/profile text so the conflict does not recur.
