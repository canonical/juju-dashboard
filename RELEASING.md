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
create a new release branch off of the main branch. As long as this release branch is open, that
version of the dashboard may receive updates and features.
[`release.yml`](.github/workflows/release.yml) monitors these branches, and whenever a new version
of the dashboard is merged, it will build, release, and promote the charms on [Charmhub](https://charmhub.io/) as required.

The charms are built using the `build.sh` scripts located at
[`charms/k8s-charm/build.sh`](charms/k8s-charm/build.sh) and
[`charms/machine-charm/build.sh`](charms/machine-charm/build.sh). These are run within the CI, and can
also be run manually.

### Prepare a new major or minor release

1. Merge a PR into `main` with the `severity: major` or `severity:minor` label attached.
2. After a few minutes, an automation will create a PR named `chore(release): cut x.y release`.
3. Merge the new PR to 'cut' the release, and create a new `release/x.y` branch. From this point
   onwards, the release has diverged from `main`.
4. As required, merge additional PRs into `release/x.y` as needed, for release-only functionality.
5. After a few minutes, an automation will create a PR named `Release x.y.0-beta.0`. The release's
   changelog will be in the description of the PR, and it can be edited as desired.
6. When this PR is merged a beta release will be published, and a `Release x.y.0` PR will be
   created.
7. If further changes are pushed to `release/x.y`, this PR will be closed in favour for a new
   `Release x.y.0-beta.1`. Instead if it is merged, a stable released will be published to the
   `x.y/candidate` channel.
8. After QA testing, the stable release can be promoted by running the [`Promote release to stable`](https://github.com/canonical/juju-dashboard/actions/workflows/promote-to-stable.yml)
   action, ensuring that the `release/x.y` branch is seleted from the `Use workflow from`
   drowpdown.
