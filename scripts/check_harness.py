from __future__ import annotations

from pathlib import Path
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]

REQUIRED = [
    "README.md",
    "AGENTS.md",
    "CODEX.md",
    "PRODUCT.md",
    "SAJU_ENGINE_SPEC.md",
    "MATCHING_SPEC.md",
    "SAFETY.md",
    "PRIVACY.md",
    "ROADMAP.md",
    "TEAM_STATE.toml",
    "docs/AUTONOMY_L4.md",
    "docs/ROLE_AUTHORITY_MATRIX.md",
    "docs/REDDIT_EXPERIMENT_GOVERNANCE.md",
    "docs/HUMAN_GATES.md",
    "evals/autonomy/cases.json",
    "scripts/check_l4.py",
    ".codex/config.toml",
    ".github/PULL_REQUEST_TEMPLATE.md",
    "prompts/MASTER_PROMPT.md",
    "prompts/CONTINUE.md",
]

AGENTS = [
    "architect",
    "worker",
    "explorer",
    "security-reviewer",
    "qa",
    "fast-worker",
    "reddit-operator",
    "feedback-analyst",
    "product-judge",
]

errors: list[str] = []

for rel in REQUIRED:
    if not (ROOT / rel).exists():
        errors.append(f"missing required file: {rel}")

config_path = ROOT / ".codex/config.toml"
if config_path.exists():
    try:
        with config_path.open("rb") as fh:
            config = tomllib.load(fh)
    except Exception as exc:  # noqa: BLE001
        errors.append(f"invalid .codex/config.toml: {exc}")
        config = {}

    agents = config.get("agents", {})
    for name in AGENTS:
        role = agents.get(name)
        if not isinstance(role, dict):
            errors.append(f"missing [agents.{name}] role")
            continue
        config_file = role.get("config_file")
        if not config_file:
            errors.append(f"agents.{name}.config_file missing")
            continue
        role_path = config_path.parent / config_file
        if not role_path.exists():
            errors.append(f"role config not found: {role_path.relative_to(ROOT)}")
        else:
            try:
                with role_path.open("rb") as fh:
                    tomllib.load(fh)
            except Exception as exc:  # noqa: BLE001
                errors.append(f"invalid TOML {role_path.relative_to(ROOT)}: {exc}")

state_path = ROOT / "TEAM_STATE.toml"
if state_path.exists():
    try:
        with state_path.open("rb") as fh:
            state = tomllib.load(fh)
        if state.get("maturity") not in {"l4-candidate", "l4-verified"}:
            errors.append("TEAM_STATE.toml has invalid maturity")
    except Exception as exc:  # noqa: BLE001
        errors.append(f"invalid TEAM_STATE.toml: {exc}")

if errors:
    print("Harness check FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Harness check PASSED")
print(f"Validated {len(REQUIRED)} required files and {len(AGENTS)} agent profiles.")
