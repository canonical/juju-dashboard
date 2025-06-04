# `update-changelog` action

When provided a merged PR, and a target PR, this action will update the target PR's changelog with
the content from the merged PR.

> [!note]
> Do not edit anything in `.github/actions/update-changelog`, as it is generated and my be
> overwritten at any time. Instad update `actions/src/update-changelog`, and run `yarn build` in
> the `actions` directory.
