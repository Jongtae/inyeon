# User Value Gate

Status: active governance for Issue #78 and future product milestones

## Purpose

INYEON must not treat implementation volume, passing tests, CI, privacy checks, release engineering, or autonomy evidence as proof that the product itself delivers its intended value.

The primary product question is:

> Can a real user complete the core journey in the deployed preview and receive the intended product outcome?

For v0.1, the minimum vertical slice is:

`birth input → My Saju → choose a reference → compatibility result → explanation`

Until this journey is demonstrably useful in the deployed preview, later maturity work must not outrun product reality.

## Proof ladder

Work must advance in this order:

1. **Functionality** — the primary journey executes end to end.
2. **User value** — the journey produces the intended outcome, not an empty or placeholder state.
3. **Correctness / methodology** — domain claims and calculations are validated to the required bar.
4. **Safety / privacy / reliability** — invariants, abuse boundaries, resilience, and accessibility pass.
5. **Release / recovery** — production deploy, smoke, rollback, and recovery are proven.
6. **Autonomy proof** — closed loops, behavioral evals, continuity, and recovery evidence may advance.

A later rung cannot compensate for an unproven earlier rung.

## Vertical Slice First

For a new product capability or product-recovery phase, prove one complete user-facing vertical slice before expanding infrastructure, datasets, governance artifacts, or autonomous-operation evidence.

A vertical slice is complete only when the deployed preview demonstrates the intended outcome through the real UI and real product code path.

For INYEON recovery, the first slice must include:

- realistic birth input;
- calculated Saju/Four Pillars output;
- user-comprehensible derived information;
- one working comparison path;
- candidate compatibility interpretation;
- `What clicks`, `Potential friction`, and `Why this?` candidate explanation.

## Candidate preview vs production

**Development/review preview** may show deterministic candidate compatibility rules and copy before expert approval only when all of the following are true:

- the output is clearly labeled `CANDIDATE · NOT YET EXPERT REVIEWED` or equivalent;
- no scientific-prediction or destiny claim is introduced;
- privacy and safety invariants remain unchanged;
- the candidate is reviewable and traceable to versioned rule/evidence artifacts;
- the preview is not represented as production-approved methodology.

**Production** remains fail-closed for relationship claims that have not passed the required #14/#33 methodology and cultural review gates.

Methodology review is a promotion gate, not a reason to leave the review preview functionally empty.

## Black-box Product Acceptance

A Product Acceptance check is independent of implementation self-review and asks only whether the deployed preview delivers the product goal.

It must exercise the product as a user would, without relying on internal test counts or issue-completion claims.

The gate fails when, for example:

- the primary CTA appears to work but produces no intended outcome;
- a comparison ends at `interpretation unavailable` when interpretation is the product value being tested;
- only a narrow synthetic/happy-path input range works while normal target-user input fails;
- a placeholder, disclosure, or empty state is counted as delivery of the core product value;
- unit/integration tests pass but the deployed preview cannot complete the journey.

The gate should be automated with deployed-preview E2E wherever practical. Owner review is a milestone-level secondary check, not a replacement for automation.

## Progress rule

Progress is a meaningful change in product, release, blocker, or real evidence state.

The following do not count as progress by themselves:

- more commits;
- more fixtures;
- more ADRs or status documents;
- repeated review of an unchanged candidate;
- repeated test execution without new risk or changed code;
- additional synthetic data that does not change Product Acceptance;
- autonomy-eval activity that cannot advance because lower product-value milestones are unproven.

## Anti-waste stop rule

If **three substantial implementation cycles** complete without either:

1. changing the black-box Product Acceptance state, or
2. materially reducing a concrete blocker to that acceptance,

stop the stream and re-evaluate the goal, acceptance contract, or approach before doing more work.

Do not create more preparatory artifacts merely to remain active.

This is not a Human Gate. The autonomous team should perform the re-evaluation itself unless an existing Human Gate genuinely applies.

## Human Gate boundary

Do not add routine owner approvals to compensate for weak product acceptance.

Human Gates remain limited to the identity-, legal-, financial-, irreversible-, methodology-, security-, privacy-, or owner-only boundaries defined in `docs/HUMAN_GATES.md`.

## Work traceability

Material repository changes must be backed by a GitHub Issue and completed through:

`Issue → branch/change → tests/review → PR → CI → merge → close when Definition of Done is satisfied`

A PR may advance part of a larger issue without closing it when the issue's Definition of Done is not yet satisfied.

## Issue #78 recovery ordering

Until Issue #78 passes Product Acceptance:

- #78 is the first active critical-path item;
- #14/#33 may prepare only evidence that directly unlocks the working vertical slice, but methodology promotion is not the next milestone;
- #47 production promotion, #51 external feedback operation, and #54 L4 proof must not advance as substitutes for missing core product value;
- production safety/privacy constraints remain intact.

The intended recovery order is:

`functional candidate → black-box user-value proof → methodology/cultural validation → production release/recovery → external evidence → L4 proof`
