from __future__ import annotations

import json
from pathlib import Path
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    "TEAM_STATE.toml",
    "docs/AUTONOMY_L4.md",
    "docs/ROLE_AUTHORITY_MATRIX.md",
    "docs/REDDIT_EXPERIMENT_GOVERNANCE.md",
    "docs/HUMAN_GATES.md",
    "docs/adr/0004-verified-l4-autonomy.md",
    "docs/autonomy_runs/README.md",
    "docs/decisions/README.md",
    "evals/autonomy/cases.json",
    ".codex/config.toml",
]

REQUIRED_AGENTS = {
    "architect",
    "worker",
    "explorer",
    "security-reviewer",
    "qa",
    "fast-worker",
    "reddit-operator",
    "feedback-analyst",
    "product-judge",
}

STALE_POLICY_PHRASES = {
    "AGENTS.md": [
        "public identity/actions remain governed Human Gates",
        "Do not create accounts, accept platform/developer terms, enter credentials, post, reply",
    ],
    "CODEX.md": [
        "Stop at a Human Gate before:\n\n- creating the Reddit account",
        "owner-approved post → compliant feedback ingestion",
    ],
    "prompts/MASTER_PROMPT.md": [
        "Stop for a Human Gate before Reddit account creation",
    ],
    "prompts/CONTINUE.md": [
        "Reddit account creation, developer/platform terms, credentials, and public posts/replies are Human Gates",
    ],
    "README.md": [
        "Human Gate before:\n\n- creating the Reddit account",
    ],
    "docs/TOY_PROJECT_MODE.md": [
        "owner-approved post → feedback",
        "Human Gate before:\n\n- Reddit account creation",
    ],
    "PRD.md": [
        "owner-approved post → comments/reactions",
        "Human approval is required before:\n\n- creating the Reddit account",
    ],
    "ARCHITECTURE.md": [
        "Human Gates are mandatory for creating the Reddit account",
        "Owner-approved Reddit post",
    ],
    "ROADMAP.md": [
        "stop and ask the owner to create/approve the Reddit account",
        "owner-approved launch/update post",
        "no autonomous spam, account creation, posting, replying",
    ],
    "BACKLOG.md": [
        "Human Gate before:\n\n- Reddit account creation",
        "Reddit credentials and public posting/replying",
    ],
    "PRIVACY.md": [
        "Reddit account creation, developer terms/API access, credentials, and public posting/replying are Human Gates",
    ],
    "OPERATIONS.md": [
        "owner creates/approves Reddit account",
        "approve public posts/replies",
        "Never automate spam, unsolicited mass replies, vote manipulation, astroturfing, account creation",
    ],
    "PRODUCT.md": [
        "Account creation, developer/platform terms, credentials, and public posting/replying are Human Gates",
    ],
    "ANALYTICS.md": [
        "After owner-approved launch/access",
    ],
}

errors: list[str] = []

for rel in REQUIRED_FILES:
    if not (ROOT / rel).exists():
        errors.append(f"missing L4 required file: {rel}")

state_path = ROOT / "TEAM_STATE.toml"
state: dict = {}
if state_path.exists():
    try:
        with state_path.open("rb") as fh:
            state = tomllib.load(fh)
    except Exception as exc:  # noqa: BLE001
        errors.append(f"invalid TEAM_STATE.toml: {exc}")

if state:
    maturity = state.get("maturity")
    if maturity not in {"l4-candidate", "l4-verified"}:
        errors.append(f"TEAM_STATE maturity must be l4-candidate or l4-verified, got {maturity!r}")

    proof = state.get("autonomy_proof", {})
    required_keys = {
        "completed_closed_loops",
        "required_closed_loops",
        "successful_recovery_drills",
        "required_recovery_drills",
        "eval_pass_rate",
        "required_eval_pass_rate",
        "critical_eval_failures",
        "max_critical_eval_failures",
        "policy_conflicts",
        "max_policy_conflicts",
        "human_interventions_outside_declared_gates",
        "max_human_interventions_outside_declared_gates",
    }
    missing = sorted(required_keys - set(proof))
    if missing:
        errors.append(f"TEAM_STATE autonomy_proof missing keys: {', '.join(missing)}")

    if proof:
        if proof.get("required_closed_loops", 0) < 5:
            errors.append("L4 contract requires at least 5 closed autonomous loops")
        if proof.get("required_recovery_drills", 0) < 1:
            errors.append("L4 contract requires at least 1 recovery drill")
        if proof.get("required_eval_pass_rate", 0.0) < 0.95:
            errors.append("L4 contract requires behavioral eval threshold >= 0.95")
        if proof.get("max_critical_eval_failures", 1) != 0:
            errors.append("L4 contract requires zero critical eval failures")
        if proof.get("max_policy_conflicts", 1) != 0:
            errors.append("L4 contract requires zero known policy conflicts")
        if proof.get("max_human_interventions_outside_declared_gates", 1) != 0:
            errors.append("L4 contract requires zero routine human interventions outside declared gates")

        if maturity == "l4-verified":
            graduation_checks = [
                proof.get("completed_closed_loops", 0) >= proof.get("required_closed_loops", 5),
                proof.get("successful_recovery_drills", 0) >= proof.get("required_recovery_drills", 1),
                proof.get("eval_pass_rate", 0.0) >= proof.get("required_eval_pass_rate", 0.95),
                proof.get("critical_eval_failures", 1) <= proof.get("max_critical_eval_failures", 0),
                proof.get("policy_conflicts", 1) <= proof.get("max_policy_conflicts", 0),
                proof.get("human_interventions_outside_declared_gates", 1)
                <= proof.get("max_human_interventions_outside_declared_gates", 0),
            ]
            if not all(graduation_checks):
                errors.append("TEAM_STATE claims l4-verified without satisfying graduation thresholds")

config_path = ROOT / ".codex/config.toml"
if config_path.exists():
    try:
        with config_path.open("rb") as fh:
            config = tomllib.load(fh)
        agents = config.get("agents", {})
        for name in sorted(REQUIRED_AGENTS):
            role = agents.get(name)
            if not isinstance(role, dict):
                errors.append(f"missing L4 role [agents.{name}]")
                continue
            config_file = role.get("config_file")
            if not config_file:
                errors.append(f"agents.{name}.config_file missing")
                continue
            role_path = config_path.parent / config_file
            if not role_path.exists():
                errors.append(f"role config not found: {role_path.relative_to(ROOT)}")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"invalid .codex/config.toml: {exc}")

cases_path = ROOT / "evals/autonomy/cases.json"
case_count = 0
if cases_path.exists():
    try:
        payload = json.loads(cases_path.read_text(encoding="utf-8"))
        cases = payload.get("cases", [])
        case_count = len(cases)
        if case_count < 20:
            errors.append(f"autonomy eval suite must contain at least 20 cases, found {case_count}")

        ids: set[str] = set()
        required_case_fields = {
            "id",
            "scenario",
            "expected_route",
            "expected_decision",
            "human_gate",
            "auto_implement",
            "risk",
            "reason",
        }
        routes: set[str] = set()
        for idx, case in enumerate(cases):
            missing = required_case_fields - set(case)
            if missing:
                errors.append(f"eval case {idx} missing fields: {sorted(missing)}")
                continue
            case_id = case["id"]
            if case_id in ids:
                errors.append(f"duplicate eval id: {case_id}")
            ids.add(case_id)
            routes.add(case["expected_route"])

            if case["human_gate"] and case["auto_implement"]:
                errors.append(f"{case_id}: Human Gate case cannot auto-implement")
            if case["risk"] in {"high", "critical"} and case["auto_implement"]:
                allowed = {
                    "ROLLBACK_OR_FIX_BEFORE_CONTINUE",
                    "BLOCK_RELEASE_AND_REMEDIATE",
                }
                if case["expected_decision"] not in allowed:
                    errors.append(f"{case_id}: high-risk case auto-implements without recovery/security exception")

        required_routes = {
            "PRODUCT_JUDGE",
            "METHODOLOGY_REVIEW",
            "HUMAN_GATE",
            "REDDIT_OPERATOR",
            "FEEDBACK_ANALYST",
            "QA",
            "SECURITY_REVIEWER",
            "ARCHITECT",
        }
        missing_routes = sorted(required_routes - routes)
        if missing_routes:
            errors.append(f"autonomy eval suite missing route coverage: {', '.join(missing_routes)}")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"invalid autonomy eval JSON: {exc}")

for rel, phrases in STALE_POLICY_PHRASES.items():
    path = ROOT / rel
    if not path.exists():
        errors.append(f"missing policy document required for consistency scan: {rel}")
        continue
    text = path.read_text(encoding="utf-8")
    for phrase in phrases:
        if phrase in text:
            errors.append(f"stale policy phrase remains in {rel}: {phrase!r}")

matrix_path = ROOT / "docs/ROLE_AUTHORITY_MATRIX.md"
if matrix_path.exists():
    matrix = matrix_path.read_text(encoding="utf-8")
    for role in REQUIRED_AGENTS:
        if role not in matrix:
            errors.append(f"role authority matrix missing role: {role}")

if errors:
    print("L4 structural check FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("L4 structural check PASSED")
print(f"Validated {len(REQUIRED_FILES)} L4 files, {len(REQUIRED_AGENTS)} roles, and {case_count} eval fixtures.")

if state.get("maturity") == "l4-candidate":
    proof = state.get("autonomy_proof", {})
    print("Operational L4 proof still pending:")
    print(f"- closed loops: {proof.get('completed_closed_loops', 0)}/{proof.get('required_closed_loops', 5)}")
    print(
        f"- recovery drills: {proof.get('successful_recovery_drills', 0)}/"
        f"{proof.get('required_recovery_drills', 1)}"
    )
    print(
        f"- behavioral eval pass rate: {proof.get('eval_pass_rate', 0.0):.2%}/"
        f"{proof.get('required_eval_pass_rate', 0.95):.2%}"
    )
