# Releasing Juju Dashboard

To release the dashboard, first follow the [QA steps](#qa-steps), then you will
need to do a [dashboard GitHub release](#release-the-dashboard) then [release both
charms](#release-charms).

- [Releasing Juju Dashboard](#releasing-juju-dashboard)
  - [Deployments](#deployments)
    - [Local machine controller](#local-machine-controller)
    - [Local k8s controller](#local-k8s-controller)
  - [QA steps](#qa-steps)
  - [Release the dashboard](#release-the-dashboard)

## Deployments

Juju dashboard can be deployed in a number of different scenarios. Each one needs
to be QAed to ensure a successful release.

### Local machine controller

If you don't already have a local controller you will need [to set one up](/HACKING.md#juju-controllers-in-multipass).

As we're testing an unreleased version of the dashboard we'll need build the dashboard and
update the charm.

```shell
git clone git@github.com:canonical/juju-dashboard.git
cd juju-dashboard
yarn install
```

Next navigate to the `charms` folder and run the build script to generate the charm and replace build assets.

```shell
cd ./charms/machine-charm
./build.sh
```

Then follow the instructions to [build and
deploy](/docs/building-charms.md#building-and-testing-the-machine-charm)
the machine charm and finally, follow the [QA steps](#qa-steps).

### Local k8s controller

To QA the dashboard in Kubernetes you will need a local k8s environment which can be set up using Multipass and [a cloud init script](/HACKING.md#multipass-cloud-init-scripts).

Once you have K8s running, shell or ssh into the Multipass container that is
running K8s and follow the instructions to [build and
deploy](/docs/building-charms.md#building-and-testing-the-k8s-charm)
the Kubernetes charm and finally, follow the [QA steps](#qa-steps).

## QA steps

The following QA steps should be preformed in each of the
[deployments](#deployments) before doing a dashboard release.

- [ ] Check that you can log in and out both using a username/password as well
      as through an external provider.
- [ ] Check that the controllers list displays the available controller(s).
- [ ] Check that your models appear in the model list.
- [ ] Check that you can search and filter models.
- [ ] Check that you can modify model access.
- [ ] Check that you can only see the models you have access to.
- [ ] Check that you can view a model details page.
- [ ] Check that you can search applications and perform multiple actions on
      multiple apps.
- [ ] Check that you can configure an application.
- [ ] Check that you can perform actions on units.
- [ ] Check that you can view the action logs for a model.
- [ ] Check that the dashboard works at various screen sizes, including mobile.
- [ ] Check that the dashboard works across browsers.
- [ ] (JAAS only) check that you can perform cross-model searches.
- [ ] (JAAS only) check that you can view audit logs for a model.
- [ ] (JAAS only) check that you can view audit logs for a controller.

## Release the dashboard

The release process is governed via a collection of automations. Release branches are maintained by
the [`create-cut-pr.yml`](.github/workflows/create-cut-pr.yml) and
[`create-release-pr.yml`](.github/workflows/create-release-pr.yml) workflows. A cut PR is used to
create a new release branch off of `main`. As long as this release branch is open, that
version of the dashboard may receive updates and features.
[`release.yml`](.github/workflows/release.yml) watches `release/x.y` branches. When it sees a
version that is not yet published on Charmhub, it builds, releases, and promotes the charms on
[Charmhub](https://charmhub.io/).

Developers add release notes directly to the `## Unreleased` section of `CHANGELOG.md` on a
`release/x.y` branch. The automations do not parse commit messages or PR labels for changelog
entries. The release PR finalises `CHANGELOG.md` by moving the current `## Unreleased` entries
under a versioned heading before the PR is merged.

The charms are built using the `build.sh` scripts located at
[`charms/k8s-charm/build.sh`](charms/k8s-charm/build.sh) and
[`charms/machine-charm/build.sh`](charms/machine-charm/build.sh). These are run within the CI, and can
also be run manually.

### Prepare a new major or minor release

1. Merge a PR into `main` with the `severity: major` or `severity: minor` label attached.
2. After a few minutes, an automation will create a PR named `chore(release): cut x.y release`.
3. Merge the new PR to 'cut' the release and create a new `release/x.y` branch. A new
   `CHANGELOG.md` is created automatically; the `## Unreleased` section is blank for a major
   release, and inherits `main`'s current entries for a minor release. From this point onwards,
   the release has diverged from `main`.
4. As required, merge additional PRs into `release/x.y` as needed, for release-only functionality.
   Add the changelog entries for these PRs under `## Unreleased` in `CHANGELOG.md` on the
   `release/x.y` branch.
5. Once there are entries under `## Unreleased`, an automation will create a PR named
   `Release x.y.0-beta.0`.
6. When this PR is merged a beta release will be published to the `x.y/beta` channel, and a
   `Release x.y.0` PR will be created.
7. If further changes are pushed to `release/x.y`, the `Release x.y.0` PR will be closed in
   favour of a new `Release x.y.0-beta.1`. When that beta PR is merged, beta release
   `x.y.0-beta.1` will be published to the `x.y/beta` channel.
8. When a `Release x.y.0` PR is merged, a stable release will be published to the `x.y/candidate`
   channel. Stable release notes are aggregated from `## Unreleased` plus any `## [x.y.z-beta.*]`
   sections since the previous stable release.
9. After QA testing, the stable release can be promoted by running the [`Promote release to stable`](https://github.com/canonical/juju-dashboard/actions/workflows/promote-to-stable.yml)
   action, ensuring that the `release/x.y` branch is selected from the `Use workflow from`
   dropdown.

### Bootstrapping an existing release branch

If a `release/x.y` branch already exists but is not using this new release process, add a
`CHANGELOG.md` at the root of the branch with the following content:

```markdown
# Changelog

## Unreleased
```

Then update `package.json` to the version that has already been published (e.g. `x.y.z` or
`x.y.z-beta.w`), and ensure a corresponding `v<version>` GitHub tag already exists. `release.yml`
uses the presence of a `refs/tags/v<version>` tag in its workflow-level run check, and the
upload/promote steps are each gated by per-charm Charmhub idempotence. Without the tag, the
workflow would proceed past the run check and attempt to publish an already-published version.
Once both the `CHANGELOG.md` update and tag are in place, a release PR for the next relevant
version will be opened automatically when the next change lands on the branch.
