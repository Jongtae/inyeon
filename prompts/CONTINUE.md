Read `TEAM_STATE.toml`, `AGENTS.md`, `CODEX.md`, `docs/AUTONOMY_L4.md`, `docs/ROLE_AUTHORITY_MATRIX.md`, `docs/HUMAN_GATES.md`, `ROADMAP.md`, and `BACKLOG.md`. Reconcile the machine-readable team state with the actual repository, GitHub issues, CI/release state, and current Human Gates before selecting work.

Then continue executing the highest-value unblocked issue on the active Independent Release critical path:

`#1 → #8 → #9-14 → #33-34 → #50/#49 → #53/static web UI + explanation → #43 → #52 → #47 → #51`

Historical marketplace P0 labels do not outrank this path.

Persist through implementation, tests, privacy/security review, independent QA, CI, PR/merge, docs/ADR/Decision Ledger updates, issue closure, release integration, and `TEAM_STATE.toml` updates. Then continue to the next unblocked issue without waiting for me.

Keep the first release zero-backend: GitHub Actions + GitHub Pages, with protected personal birth/comparison inputs only in browser memory. Do not add GCP/backend persistence unless a concrete requirement proves static architecture insufficient and the architecture/privacy change passes current Human Gates.

Do not greenfield calendrical primitives that the validated open-source Manseryeok adapter can provide. Adopt/wrap/pin/differential-test/golden-test first; implement only proven gaps.

For Reddit, use standing authorization for maximum practical autonomy. Routine permitted community research, posting, replies, monitoring, and follow-up do not require repeated approval once an authorized account/integration exists. Stop only at the smallest genuine Human Gate such as CAPTCHA, MFA, email/phone/identity verification, owner-only terms acceptance, credential recovery, materially ambiguous subreddit rules, or material legal/reputational risk; then resume autonomously after that step is completed.

For material Reddit-driven product learning preserve separate contexts:

`Product Judge preregistration → Reddit Operator → raw evidence → Feedback Analyst → Product Judge → Decision Ledger → Worker → QA/Security → release → observation`.

Do not treat upvotes as product truth, do not let Reddit opinion directly change Saju methodology, and do not collapse acquisition performance into product-value conclusions.

Run `python scripts/check_harness.py` and `python scripts/check_l4.py` as part of governance verification. Use `evals/autonomy/cases.json` for behavioral role/decision evals when the runtime supports them.

Do not claim `l4-verified` until every graduation criterion in `docs/AUTONOMY_L4.md` is backed by real evidence. If a Human Gate blocks only one workstream, record the exact minimal blocker in state and continue all other unblocked work.

Do not stop merely to tell me what you intend to do. Continue toward a real GitHub Pages production release and then through repeated observe → decide → ship → verify autonomous cycles.
