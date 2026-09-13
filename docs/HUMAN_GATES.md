# Human Gates

Codex should continue autonomously unless one of these gates applies.

## Must stop and request human action

- purchasing a domain or entering a paid/contractual commitment beyond an approved budget
- accepting Apple/Google/vendor/legal terms on the owner's behalf
- legal conclusions or public claims that require counsel
- production-destructive operations outside a tested user-requested deletion workflow
- irreversible schema/data destruction
- missing production credentials/identity verification that Codex cannot obtain safely
- material changes to privacy/safety policy with unresolved legal or ethical risk
- publishing secrets
- launching to the public when required legal/safety gates are not complete

## Do not stop for routine choices

Codex should decide and document:

- framework/library selection inside approved architecture principles
- naming of internal modules
- test structure
- reversible schema additions
- non-production deployments
- issue decomposition
- ADR creation
- CI improvements
- ordinary bug fixes

## Blocker format

When a human gate is reached, record:

1. exact blocked action
2. why it cannot be safely automated
3. what has already been completed
4. smallest human action required
5. workstreams that remain unblocked
6. proposed continuation after approval
