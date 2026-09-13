# ADR 0006 — Static npm workspace and GitHub Pages release

- Status: Accepted
- Date: 2026-09-13
- Owners: INYEON
- Builds on: ADR 0001 — Independent Release, Zero-Backend First Release

## Context

ADR 0001 fixes the zero-backend runtime boundary but leaves the implementation toolchain, project-site routing, and repeatable release/rollback mechanism open. GitHub Pages serves files under a repository base path and does not provide an application-server rewrite for arbitrary SPA routes.

## Decision

### Workspace and build

- Use one private root `npm` workspace with a committed `package-lock.json`; CI installs with `npm ci`.
- Put the deployable application in `apps/web` and reusable, framework-independent TypeScript domain code in `packages/*`.
- Use React, TypeScript, and Vite for the static browser application. Emit only static HTML, CSS, JavaScript, and versioned public assets.
- Keep packages ESM-first and do not couple domain package contracts to React, Vite, browser storage, or an upstream Saju API.
- Pin the Node major used by local development and Actions. Dependency changes must update and review the lockfile.

`npm` is selected because it ships with Node and needs no additional package-manager bootstrap. A different workspace manager is not justified until measured install, publishing, or workspace-scale pain exists.

### Pages base path and routes

- Build the production artifact with one explicit, tested base path: `/inyeon/` for the repository project site. Local development uses the same default so base-path defects are visible before CI; `VITE_BASE_PATH=/` may be used only for an explicit root-host preview.
- Resolve application assets through Vite's base-aware mechanisms; do not hard-code root-relative `/assets/...` URLs.
- Use hash routing for client-rendered routes, for example `/inyeon/#/people/<slug>`. The portion before `#` always resolves to the deployed `index.html`, so refresh and direct-open do not require a server rewrite.
- Do not use a copied `404.html` SPA redirect as the primary router. Stable search/social pages that require crawler-visible metadata may be generated as real static HTML paths in a later bounded addition.
- Route tests must cover the repository base path, direct-open, refresh, unknown-route recovery, and asset loading.

### CI, deployment, and rollback

- Pull requests run governance checks, `npm ci`, lint, type-check, tests, and production build. Pages deployment consumes the already-tested static artifact.
- Deploy through GitHub's Pages Actions integration from the protected default branch or an explicit manual release dispatch. Use one deployment concurrency group so an older run cannot overwrite a newer release.
- Identify every release by source commit SHA and artifact metadata. Do not maintain a hand-edited `gh-pages` branch as a second source of truth.
- Rollback means redeploying a recorded last-known-good commit through the same build-and-deploy workflow. If default-branch history must remain monotonic, revert the bad change and deploy the revert. Never reconstruct or edit production files manually.
- A release is complete only after production smoke checks. A rollback rehearsal must demonstrate that the recorded SHA can be rebuilt, deployed, and verified.

Custom-domain purchase, DNS ownership, and owner-only credentials remain Human Gates. They are not required to ship the repository project site over HTTPS.

## Alternatives considered

- **pnpm/Turborepo/Nx:** rejected for the bootstrap because the small workspace does not yet have measured orchestration or install pain. ADR 0005 governs future framework adoption.
- **Next.js or another server-oriented framework:** rejected because server rendering and runtime functions add concepts the static release does not need.
- **Browser-history routing with a Pages 404 redirect:** rejected as more fragile and harder to verify than hash routing.
- **Manual Pages uploads or a mutable deployment branch:** rejected because provenance and rollback would be weaker.

## Consequences

The runtime stays portable static output, local setup stays small, and all client routes work under the GitHub project base path. URLs contain `#`, and personalized crawler-visible pages are unavailable; prebuilt public pages can be added without changing the personal-data architecture.

## Security / privacy / safety impact

The browser bundle may contain only public code and assets, never runtime secrets. Build and deployment metadata may be retained by GitHub, but protected personal values must never enter Actions inputs/artifacts. Dependency and secret scanning remain release gates.

## Rollback / migration

Changing the repository name/domain requires changing the single base-path configuration and rerunning route tests. Migrating to another static host reuses the artifact after base-path adjustment. Introducing any application backend remains governed by ADR 0001 and `docs/HUMAN_GATES.md`; this ADR does not authorize it.

## Evidence to revisit

Revisit hash routing only if verified SEO/social requirements cannot be met by bounded prebuilt public pages. Revisit npm only after recurring workspace friction is recorded. Revisit the hosting model only when a concrete product capability proves static hosting insufficient under ADR 0001.
