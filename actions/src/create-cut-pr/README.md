# `create-cut-pr` action

This action creates a PR that cuts a new `release/x.y` branch. It is triggered by
pushes to `main` (typically a merged PR).

- It inspects the recently-merged PRs into `main` to determine whether the next
  release is a major or minor bump. If no merged PR can be matched, it defaults
  to minor (e.g. when a commit is pushed directly).
- If a matching cut PR already exists, it reuses it.
- Otherwise it creates `cut/x.y` and `release/x.y` branches, sets `package.json`
  to `x.y.x` and copies `CHANGELOG.md` from `main`. Major releases start with a
  clean `## Unreleased` section; minor releases inherit `main`'s current entries.

> [!note]
> Do not edit anything in `.github/actions/create-cut-pr`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/create-cut-pr`, and run `yarn build` in
> the `actions` directory.
