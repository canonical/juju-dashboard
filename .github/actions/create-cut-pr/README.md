# `create-cut-pr` action

This action will create and return a branch and pull request that cuts a new release branch. If a
cut PR already exists, it will be updated and returned. If a PR doesn't exist, a minor release will
be created.

> [!note]
> Do not edit anything in `.github/actions/create-cut-pr`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/create-cut-pr`, and run `yarn build` in the
> `actions` directory.
