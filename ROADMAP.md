# INYEON Roadmap and Release Gates

GitHub Issues are the executable source of truth. This roadmap defines milestone outcomes for the active **Independent Release Mode**.

The first public release is a production-grade static web product, not a two-sided dating marketplace.

## Execution principle

Build the smallest real product that can be publicly released, then improve it from observed use and Reddit feedback.

Primary critical path:

```text
M0 architecture + methodology
  ↓
validated open-source Manseryeok adapter
  ↓
normalized chart + uncertainty model
  ↓
derived compatibility features + rule engine
  ↓
public figures + synthetic references
  ↓
polished static web UX + sharing
  ↓
privacy/release hardening
  ↓
GitHub Pages production release
  ↓
Reddit feedback loop + iterative improvement
```

The historical dating-marketplace roadmap is deferred until the owner explicitly activates Marketplace Mode.

## M0 — Reconcile architecture and methodology

Primary work: #1, #2, #3, #6, #8 and active architecture/privacy ADRs.

Exit:

- Codex harness works in the actual execution environment;
- static web / GitHub Pages architecture is chosen and documented;
- `korean-saju-v1` methodology boundaries are explicit;
- pinned open-source Manseryeok candidate is wrapped behind `InyeonSajuAdapter`;
- upstream license/version/upgrade policy is documented;
- independent reference strategy is defined;
- prohibited compatibility claims and inclusive language rules are explicit;
- zero-retention privacy boundary is an architectural invariant.

**Gate:** do not let implementation silently invent calendrical conventions or personal-data persistence.

## M1 — Deterministic compatibility core

Primary work: #8–#14, #33, #34, #52.

Exit:

- normalized Four Pillars output is deterministic and versioned;
- timezone/solar-term/year-month/day-hour boundary behavior is validated around upstream behavior instead of unnecessarily reimplemented;
- unknown/approximate/disputed time is represented explicitly;
- derived chart features exist for compatibility v1;
- versioned compatibility-rule DSL/evidence generator works;
- deterministic explanation inputs are stable;
- at least 200 golden/reference fixtures are CI-connected before public release;
- browser-only privacy tests prove personal inputs do not leave memory.

**Gate:** no public release with unresolved chart correctness around known boundaries or accidental personal-data egress.

## M2 — Reference data and usable web product

Primary work: #35, #49, #50, #53, methodology/privacy pages.

Exit:

- 500+ sourced public-figure records with provenance and categorical birth-data/source status;
- unknown/disputed public-figure birth times suppress unsupported claims;
- synthetic-character library/generator covers compatibility space reproducibly;
- public figures and synthetic characters are technically distinct from real users;
- user can complete `My Saju → Public Figure → Synthetic Character → Someone I Know` flows;
- when reviewed relationship rules exist, `What clicks / Potential friction / Why this?` output is clear and balanced; while the approved catalog is empty, these sections are absent and the no-approved-evidence state is explicit;
- loading/error/empty states, responsive design, and accessibility are release quality.

Issue #53 implements this bounded candidate UI and its CI Chromium regression layer. M2 relationship meaning remains gated by #14/#33; sharing, broader privacy verification, and production release remain M3/M4 work rather than evidence that the product is already public.

**Gate:** public figures must not be presented as members/endorsers, and synthetic characters must never simulate real dating supply.

## M3 — Sharing and distribution readiness

Primary work: #43 plus public-figure static entry pages.

Exit:

- client-generated share card works on supported browsers;
- native Web Share is used when available with graceful fallback;
- default share payload contains no protected birth inputs;
- share-safe links use an allowlist and never encode raw birth date/time/place;
- optional `Compare with me` flow has explicit disclosure before sharing any derived personal representation;
- public-figure pages have stable shareable URLs and prebuilt metadata/OG assets where practical;
- sharing tests cover privacy, direct-link behavior, and image generation.

**Gate:** no share path may turn the zero-retention privacy design into accidental public disclosure.

## M4 — Production hardening and GitHub Pages release

Primary work: #47, #52 and release hardening.

Exit:

- production artifact is reproducible through GitHub Actions;
- GitHub Pages serves the real public product over HTTPS;
- direct refresh/deep links work with the chosen static-routing strategy;
- no client-side secret/API key exists;
- privacy tests intercept network/storage/cache/console paths;
- dependency/secret/security scans pass;
- production error/loading behavior is polished;
- rollback/redeploy from a known-good commit is rehearsed;
- public methodology, data-source uncertainty, and privacy disclosures are live;
- production smoke tests pass.

Optional Human Gate:

- custom domain purchase/DNS configuration, if desired.

**Gate:** local success is not release success. Production URL, repeatable deploy, privacy invariants, and rollback must work.

## M5 — Reddit launch and governed feedback loop

Primary work: #51.

Codex may create/configure the Reddit account and operate it when technically available, legally permitted, and community rules are clear. Stop only for CAPTCHA, email/phone/identity verification, MFA, owner-only terms acceptance or credential recovery, ambiguous community rules, or material legal/reputational risk.

Exit:

- transparent launch/update post is published in communities whose rules permit it;
- feedback can be ingested through an approved API path or manual/semi-automatic import;
- Reddit content is treated as untrusted data;
- comments are redacted, classified, deduplicated, and clustered;
- repeated/evidenced feedback can create/update GitHub issues;
- safe reversible changes can enter the normal Codex PR/test/release loop;
- methodology/privacy/security/major-product-direction changes remain Human Gates;
- source cluster → issue → PR → release traceability exists;
- weekly synthesis can report what users liked, misunderstood, requested, and what shipped.

**Gate:** no spam, deceptive identities, vote manipulation, ban/rate-limit evasion, or bypass of Reddit access controls/community rules.

## M6 — Iterate on real use

Operating loop:

```text
OBSERVE
  ↓
REDUCE TO EVIDENCE
  ↓
ISSUE / EXPERIMENT
  ↓
IMPLEMENT
  ↓
TEST
  ↓
RELEASE
  ↓
VERIFY
```

Priority order:

1. correctness;
2. privacy/security;
3. broken UX/reliability;
4. clarity/trust;
5. accessibility/performance;
6. useful new features;
7. growth experiments.

Business success is optional; release quality and learning are not.

## Deferred Marketplace Mode

The following historical work remains available but is not on the active first-release critical path:

- accounts/auth;
- profile/preferences;
- real-user discovery/ranking;
- likes/matches/chat;
- moderation at dating-marketplace scale;
- identity/liveness verification;
- payments/subscriptions;
- city liquidity/seeding;
- app-store/native mobile release;
- server-side LLM runtime;
- durable personal-data storage.

Activating any of these as a real product direction should trigger a new architecture/privacy review rather than silently expanding the static release.

## Cross-milestone Human Gates

Codex should stop for:

- CAPTCHA, email/phone/identity verification, MFA, owner-only Reddit developer/platform terms acceptance, or credential recovery;
- ambiguous subreddit/community-rule compliance;
- purchasing/configuring a custom domain if credentials/paid commitment are needed;
- introducing a paid external vendor or material spend;
- introducing backend/cloud state that changes privacy architecture;
- changing Saju methodology from evidence/feedback without explicit review;
- material privacy/security changes;
- public claims with meaningful legal/reputational risk.

A Human Gate in one workstream should not freeze unrelated unblocked work.
