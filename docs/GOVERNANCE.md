# Engineering and Product Governance

## Change classes

### Class A — autonomous

Code, tests, docs, branches, PRs, CI, IaC, non-production migrations, staging deploys, issue maintenance, observability, reversible dependency updates.

### Class B — autonomous + ADR

Core schema changes, new managed services, architecture boundaries, ranking feature families, calculation methodology decisions, external API integration.

### Class C — human gate

See `HUMAN_GATES.md`.

## ADR threshold

Create an ADR when a decision changes one of:

- system boundary
- persistent data contract
- security/privacy posture
- Saju methodology
- ranking semantics
- production provider with meaningful lock-in/cost
- public product policy

Use `docs/adr/NNNN-title.md`.
