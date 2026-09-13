# ADR 0005 — Product-first framework adoption

Status: Accepted  
Date: 2026-09-13

## Context

INYEON is both a real product and the first serious dogfood environment for Autonomous Product Harness (APH). That creates a structural risk: product development can drift into becoming a showcase for every framework or integration that APH may eventually support.

Potential integrations such as GitHub Spec Kit, Ruflo, and AgentOS can each add useful capabilities, but they also add configuration, duplicated state, additional failure modes, and coordination overhead. INYEON already has a workable stack built around GitHub Issues/docs, Codex native multi-agent execution, APH-style governance, GitHub Actions, and GitHub Pages.

The product must not absorb infrastructure merely to demonstrate APH extensibility.

## Decision

INYEON is a **product first** and an APH **dogfood/reference implementation second**.

The default active stack remains:

`GitHub issues/docs → Codex native multi-agent → APH governance/state/evals → GitHub Actions → GitHub Pages`

Spec Kit, Ruflo, AgentOS, or similar frameworks are **not active dependencies** unless a repeated observed problem justifies them.

Use the rule:

> **Observed pain before framework.**

A framework may be evaluated only when there is durable evidence of a recurring problem that the current stack handles poorly. Examples:

- Spec Kit: repeated requirement drift, loss of feature-spec traceability, or issue-to-implementation ambiguity.
- Ruflo: native multi-agent execution becomes insufficient for dependency-aware parallelism, scheduling, or large worker pools.
- AgentOS: session/machine boundaries, long-running ownership, retries, persistent workloads, or execution continuity become a real operational bottleneck.

Framework adoption must satisfy all of the following:

1. the pain is recorded with concrete examples;
2. the proposed framework has a clearly bounded responsibility;
3. canonical sources of truth remain explicit;
4. it does not weaken current privacy, security, architecture, or Human Gate policy;
5. expected complexity removed is greater than complexity introduced;
6. adoption is reversible or has a documented exit path;
7. the Product Judge/architect may reject adoption even if the integration is technically interesting.

## Authority boundaries

If optional frameworks are introduced later, the authority model is:

- **APH / repository governance** — product authority, Human Gates, decision policy, role authority, autonomy verification.
- **GitHub** — canonical work identity, source, PR/CI/release audit trail.
- **Spec Kit** — optional planning/specification projection; it does not become a higher-order policy authority.
- **Ruflo** — optional execution/orchestration engine; it cannot overrule APH decisions or expand approved scope.
- **AgentOS** — optional runtime/persistence layer; operational state may live there, but product decisions remain canonical in repository governance/Decision Ledger.

No integration may create a second competing product truth.

## Consequences

### Positive

- INYEON stays small enough to ship.
- APH is tested under realistic constraints rather than artificial showcase requirements.
- Framework integrations are justified by evidence instead of enthusiasm.
- Split-brain state and duplicated governance are less likely.
- APH can remain framework-agnostic while INYEON uses only what it needs.

### Negative

- Some APH integrations will not be dogfooded immediately in INYEON.
- Future adoption may require migration work rather than being preinstalled.
- INYEON will not serve as a demo of every supported integration.

These costs are accepted.

## Relationship to APH

The public `Jongtae/autonomous-product-harness` project may support adapters/integration guidance for Spec Kit, Ruflo, AgentOS, and other tools. INYEON is not required to enable those adapters.

A healthy relationship is:

`INYEON discovers real governance/product-operation pain → APH generalizes reusable patterns → INYEON adopts only the subset that improves the product.`

Not:

`APH adds a capability → INYEON must install it to demonstrate the framework.`
