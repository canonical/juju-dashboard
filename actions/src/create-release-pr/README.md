# `create-release-pr` action

This action should be triggered by a PR merged into a `release/x.y` branch. This action will create
a new release PR, which will target the `release/x.y` branch with a commit bumping the package
version.

The package version may be bumped in one of the following ways:

 1. If the merged PR was a `beta` release PR (specifically, the merged PR branch was
    `release/x.y.z-beta.w`), the package version (which should be set to `x.y.z-beta.w`) will be
    set as `x.y.z`. This would set the package up for a candidate release.

 2. If the merged PR was a `candidate` release PR (the merged PR branch was `release/x.y.z`), then
    it will be ignored and no release PR will be created.

 3. For all other merged PRs, the package will be bumped to a beta version with the following
    rules:

    - If the package version is `x.y.z`, the beta version will be set to `x.y.(z+1)-beta.0`. Since
      the current version was a stable release, the patch version can be incremented (since only
      patch releases are allowed on a `release/x.y` branch), and the `beta` pre-release can be set.

    - If the package version is `x.y.z-beta.w`, the beta version will be set to `x.y.z-beta.(w+1)`.


> [!note]
> Do not edit anything in `.github/actions/create-release-pr`, as it is generated and may be
> overwritten at any time. Instead update `actions/src/create-release-pr`, and run `yarn build` in
> the `actions` directory.
