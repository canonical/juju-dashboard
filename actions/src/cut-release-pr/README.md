# `cut-release-pr` action

This action will create and return a branch and pull request that cuts a new release branch. If a
release PR has already been cut, it will be updated and returned. If a PR doesn't exist, a minor
release will be created.

> [!note]
> Do not edit anything in `.github/actions/update-changelog`, as it is generated and my be
> overwritten at any time. Instad update `actions/src/update-changelog`, and run `yarn build` in
> the `actions` directory.
