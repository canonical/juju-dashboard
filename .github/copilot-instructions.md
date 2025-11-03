# Guidance for AI coding agents working on Juju Dashboard

Keep this short and actionable — focus on what makes this repo unique so an agent can be productive immediately.

- Architecture summary

  - Frontend React + TypeScript single-page app built with Vite. Core UI lives under `src/`.
  - State: Redux Toolkit slices in `src/store` (selectors, thunks and middleware). Important middleware: `src/store/middleware/model-poller.ts` (WebSocket controller handling) and `src/store/middleware/check-auth.ts` (auth gating).
  - Integrations: connects to Juju controllers over WebSocket using `@canonical/jujulib` and macaroon auth via `@canonical/macaroon-bakery`.
  - Workspace includes an `actions/` package used for auxiliary tools; `charms/` contains charm packaging helpers and Docker-related assets.

- Developer workflows (commands & files)

  - Install: `yarn install` (project uses Yarn v4 — `packageManager` in `package.json`).
  - Dev server: `yarn start` (Vite; see `vite.dev.config.ts`). For JAAS-mode dev use `yarn start-jaas`.
  - Build: `yarn build` (runs `vite build` then `./scripts/generate-version-file`).
  - Tests: unit/unit-integration via Vitest: `yarn test`. E2E tests use Playwright (see `playwright.config.ts` and `docs/local-e2e-setup.md`).
  - Lint/typecheck: `yarn lint`, `yarn typescript-check` (tsc --noEmit). Run both in PRs.
  - Docker image: `DOCKER_BUILDKIT=1 docker build -t juju-dashboard .` (used by charms/PR demo flows).

- Project-specific conventions & patterns

  - Components: function components only; one component per directory with `_component.scss`, `Component.tsx`, `Component.test.tsx`, and `index.tsx` (see `HACKING.md`).
  - Styles: SCSS in `src/scss` for shared rules; component-specific SCSS lives next to the component.
  - Redux by slice: each slice in `src/store` contains the slice creator, selectors, types and tests. Use selectors (`useAppSelector`) and memoized selectors (reselect) where appropriate.
  - Tests: use Fishery factories under `src/testing/factories` instead of large data dumps.
  - Middleware: heavy logic (WebSocket, polling, controller connections) lives in `src/store/middleware` — avoid duplicating connection logic; prefer extracting helpers for testability.

- Integration points & runtime config

  - Runtime controller endpoint and mode are read from `public/config.js` (copy to `public/config.local.js` and set `controllerAPIEndpoint` and `isJuju` for local testing).
  - Auth: macaroons/identity flows — expect bakeryjs patterns and refreshed macaroons on login flows.
  - Cross-repo: `charms/` and `actions/` are used in release/deploy flows. Tests and CI may rely on `actions/` workspace tools.

- What an AI agent should do (practical rules)

  - Prefer small, focused edits. Changes to middleware or core network logic require tests and a short design note in PR description.
  - When modifying UI behavior, update or add a unit test and, if relevant, a factory in `src/testing/factories`.
  - Before suggesting changes that affect build or release scripts, check `package.json` scripts and `HACKING.md` deployment notes.
  - For controller interaction code, reference `src/store/middleware/model-poller.ts` as the canonical pattern (controllers map, `ConnectionWithFacades`, polling loops).

- Fast examples you can use
  - Start dev server: `yarn start` and open `http://localhost:8036` (port from Vite config).
  - Run unit tests and watch: `yarn test --watch` (Vitest).
  - Run Playwright e2e locally: follow `docs/local-e2e-setup.md` — ensure `public/config.local.js` points to a reachable controller.

If anything here is unclear or you'd like more detail (e.g., CI specifics, test fixtures that are commonly used, or common failure modes when connecting to controllers), ask and I'll expand the relevant section.
