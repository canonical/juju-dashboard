# `get-pr-severity` action

This action will run against the pull request that triggered the action, or a manually provided
pull request. It will determine the severity (`minor` or `major`) of the pull request based on the
version label attached to the pull request (`version: patch`/`version: minor`/`version: major`). If
no label is detected, `minor` will be the default severity.

> [!note]
> Do not edit anything in `.github/actions/get-pr-severity`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/get-pr-severity`, and run `yarn build` in
> the `actions` directory.
