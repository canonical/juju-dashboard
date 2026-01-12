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
