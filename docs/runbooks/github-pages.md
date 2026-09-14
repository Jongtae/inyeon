# GitHub Pages release and rollback runbook

Status: release engineering candidate; public deployment is blocked until the first-release correctness gate passes.

## Release contract

INYEON deploys one immutable static artifact:

`main commit → full release gates → apps/web/dist → GitHub Pages → remote Chromium smoke`

The canonical source is always a full 40-character commit SHA on `main`. The workflow rebuilds that commit from the pinned lockfile and never edits a `gh-pages` branch or production files by hand. `release-manifest.json` records the exact source SHA plus every artifact file's path, byte count, and SHA-256 digest.

The `Release GitHub Pages` workflow runs automatically for `main` only after the repository variable `INYEON_PRODUCTION_ENABLED` is exactly `true`. A manual dispatch can validate any exact `main` ancestor and is also the rollback path. While the variable is absent or false, a manual run completes the candidate gates but cannot configure, upload, or deploy Pages.

Deployment additionally runs `npm run check:production-readiness`. That check fails closed while the Saju adapter, derived features, golden corpus, or independently reviewed exact-property anchors remain non-production candidates. Do not set the variable to bypass a failing readiness check.

## First enablement

Do this only after the #14 correctness Human Gate is resolved and the reviewed capability artifacts truthfully report production eligibility.

1. Confirm `npm run check:production-readiness` passes on `main`.
2. Confirm the repository plan supports Pages for its current visibility. GitHub Free requires a public repository; private-repository Pages requires a qualifying paid plan. A Pages site is public even when its source repository is private.
3. In repository Settings → Pages, choose GitHub Actions as the publishing source. An administrator may instead create the Pages site through GitHub's Pages API with `build_type=workflow` when the authenticated token has the required Pages and administration permissions.
4. Create the repository Actions variable `INYEON_PRODUCTION_ENABLED=true`.
5. Push the approved release commit to `main`, or dispatch the workflow with that exact SHA and operation `release`.
6. Wait for build, deploy, and remote smoke jobs. Only the smoke job proves that the release is complete.
7. Record the returned HTTPS URL, verified release SHA, and last-known-good SHA in `TEAM_STATE.toml` in a follow-up pull request. Do not fill those fields from a candidate-only run.

Custom domain purchase and DNS access are optional Human Gates. The default `https://jongtae.github.io/inyeon/` project URL is sufficient for release after Pages is enabled and the correctness gate passes.

## Manual release command

From a clean checkout whose `origin/main` is current:

```bash
release_sha=$(git rev-parse origin/main)
gh workflow run pages.yml --ref main -f source_sha="$release_sha" -f operation=release
```

The workflow rejects abbreviated SHAs, commits absent from the checkout, and commits that are not ancestors of canonical `origin/main`.

## Rollback and rehearsal

Rollback means rebuilding and redeploying the recorded last-known-good `main` commit through the same workflow:

```bash
gh workflow run pages.yml --ref main -f source_sha="FULL_LAST_KNOWN_GOOD_SHA" -f operation=rollback
```

For a planned rehearsal, use `operation=rollback-rehearsal`. A rehearsal demonstrates reproducible rebuild/deploy/smoke behavior; it is not by itself an L4 incident-recovery proof. L4 recovery evidence requires an actual `detect → contain → recover → root cause → regression protection → redeploy → verify` record.

If post-deploy smoke fails:

1. do not record the new SHA as released or known-good;
2. inspect the failing workflow and preserve its run URL;
3. dispatch the recorded known-good SHA with operation `rollback`;
4. verify the rollback smoke succeeds;
5. open an incident/fix issue with no real personal input in logs or fixtures;
6. add regression protection, merge the fix, and release through the same workflow.

Do not create an automatic rollback loop before a verified last-known-good release exists.

## Static security and privacy boundary

The production build injects a CSP meta policy with same-origin scripts/styles, `connect-src 'none'`, no forms, objects, frames, workers, or base URL, plus `no-referrer`. Development does not receive this policy because Vite hot reload needs a local connection.

GitHub Pages does not let this application set arbitrary response headers. A meta CSP cannot enforce `frame-ancestors`, cannot provide report-only/reporting behavior, and does not replace response headers such as HSTS, X-Frame-Options, or X-Content-Type-Options. INYEON therefore does not claim complete security-header control on Pages and does not add a third-party CSP/error-reporting endpoint.

`npm run verify:release` checks the built artifact for high-signal secret signatures, unexpected literal origins, source maps, symlinks, release metadata, required CSP/referrer/base-path markers, and size budgets. It is defense in depth, not proof against deliberate obfuscation. The TypeScript privacy contract, runtime CSP, Playwright persistence/egress canaries, dependency audit, and deployed smoke remain separate required controls.

The React boundary covers render and lifecycle failures. Browser event-handler and asynchronous failures are not caught by React boundaries, so current CI also treats `pageerror` and console canaries as release failures. Future asynchronous features must catch and sanitize their own errors without logging private inputs.

Current release budgets are:

- total raw artifact: 2 MiB;
- deterministic gzip total: 320 KiB;
- any one file: 1 MiB;
- main JavaScript gzip: 160 KiB;
- lazy public catalog gzip: 120 KiB;
- artifact file count: 32.

Budget changes require an explained review; GitHub Pages' much larger platform ceiling is not a reason to remove a practical product budget.

## Custom domain and HTTPS

If a custom domain is later approved:

1. verify domain ownership with GitHub before changing DNS;
2. configure the domain in Pages settings/API, not by hand-editing the deployed artifact;
3. add the recommended apex and/or `www` records at the DNS provider and avoid wildcard records;
4. wait for DNS and certificate provisioning;
5. enable HTTPS enforcement;
6. rerun the deployed-origin smoke against the canonical URL;
7. update the Vite base-path contract and tests if the site moves from `/inyeon/` to `/`.

Never leave DNS pointed at a disabled Pages site, because that can create a domain-takeover risk.
