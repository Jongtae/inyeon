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
]

errors: list[str] = []

for rel in REQUIRED:
    if not (ROOT / rel).exists():
        errors.append(f"missing required file: {rel}")

config_path = ROOT / ".codex/config.toml"
if config_path.exists():
    with config_path.open("rb") as fh:
        config = tomllib.load(fh)

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

if errors:
    print("Harness check FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Harness check PASSED")
print(f"Validated {len(REQUIRED)} required files and {len(AGENTS)} agent profiles.")
