# `cut-release-pr` action

This action will create and return a branch and pull request that cuts a new release branch. If a
release PR has already been cut, it will be updated and returned. If a PR doesn't exist, a minor
release will be created.

> [!note]
> Do not edit anything in `.github/actions/cut-release-pr`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/cut-release-pr`, and run `yarn build` in the
> `actions` directory.
