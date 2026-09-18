# `create-release-pr` action

This action is triggered by pushes to a `release/x.y` branch. It maintains an
open release PR for the next relevant version based on the current `package.json`
version and the contents of `CHANGELOG.md`.

- If the branch version is a placeholder (`x.y.x`) or stable version and
  `## Unreleased` has entries, it opens a beta release PR (`release/x.y.z-beta.w`).
  A freshly cut `release/x.y` branch will therefore get its first beta PR as soon
  as it has release notes under `## Unreleased`.
- If the branch version is a beta version and `## Unreleased` has entries, it
  opens the next beta release PR.
- If a beta release PR was just merged and `## Unreleased` is empty, it opens a
  candidate/stable release PR (`release/x.y.z`).
- If an existing release PR already points to the expected version, its branch
  is reset to the latest `release/x.y` and the `package.json`/`CHANGELOG.md`
  changes are reapplied.

The release PR finalises `CHANGELOG.md` by moving the current `## Unreleased`
entries under a versioned heading. Release notes must therefore be added to
`## Unreleased` on the `release/x.y` branch **before** the release PR is merged.

> [!note]
> Do not edit anything in `.github/actions/create-release-pr`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/create-release-pr`, and run `yarn build` in
> the `actions` directory.
