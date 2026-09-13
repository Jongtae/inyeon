# Privacy Baseline

INYEON combines dating data with birth and location-derived data. Treat the dataset as highly sensitive even where a specific jurisdiction uses narrower statutory definitions.

## Data minimization

Collect only what a feature needs. Keep raw sensitive inputs separate from public/profile and analytics domains.

## Never put in analytics or general logs

- exact birth date/time
- exact birth coordinates/place text when unnecessary
- precise current location
- sexual orientation/preference values unless a tightly governed aggregate use requires them
- private message text
- verification imagery/biometrics
- auth secrets/tokens

## LLM boundary

Narrative generation should receive pseudonymous structured compatibility evidence. Names, raw birth inputs, exact location, and message content are excluded by default.

## Required user controls

- clear purpose disclosure
- consent/version records where needed
- data export
- account deletion
- category-specific retention schedules
- Couple Mode mutual consent and revocation
- privacy center

## Engineering controls

- least-privilege service roles
- encryption in transit and at rest
- dedicated secrets manager/KMS in production
- audited admin access
- production data never copied into fixtures/prompts/screenshots
- deletion tests across all intended stores
- incident-response runbook before public launch

Legal requirements must be reviewed by qualified counsel before public launch; Codex must not represent repository policy as legal certification.
