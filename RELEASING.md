# Releasing Juju Dashboard

To release the dashboard, first follow the [QA steps](#qa-steps), then you will
need to do a [dashboard GitHub release](#release-the-dashboard) then [release both
charms](#release-charms).

- [QA](#qa)
  - [Deployments](#deployments)
    - [Local machine controller](#local-machine-controller)
    - [Local k8s controller](#local-k8s-controller)
  - [QA steps](#qa-steps)
- [Release the dashboard](#release-the-dashboard)
- [Release charms](#release-charms)
  - [Machine charm](#machine-charm)
  - [Kubernetes charm](#kubernetes-charm)

## QA

### Deployments

Juju dashboard can be deployed in a number of different scenarios. Each one needs
to be QAed to ensure a successful release.

#### Local machine controller

If you don't already have a local controller you will need [to set one up](/HACKING.md#juju-controllers-in-multipass).

As we're testing an unreleased version of the dashboard we'll need build the dashboard and
manually update the charm.

```shell
git clone git@github.com:canonical/juju-dashboard.git
cd juju-dashboard
yarn install
yarn build
```

Next clone the [juju-dashboard-charm
repo](https://github.com/canonical/juju-dashboard-charm).

```shell
cd ..
git clone git@github.com:canonical/juju-dashboard-charm.git
cd juju-dashboard-charm/machine-charm
```

Remove the built dashboard files and replace them with the dashboard files that
were built above.

```shell
rm -rf src/dist/*
cp -r ../../juju-dashboard/build/* src/dist
```

Then follow the instructions to [build and
deploy](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-machine-charm)
the machine charm and finally, follow the [QA steps](#qa-steps).

#### Local k8s controller

To QA the dashboard in Kubernetes you will need a local k8s environment. This
can be quite tricky, but is possible even inside a Multipass container. We have
[a separate
guide](/docs/multipass-microk8s.md) for how you can set this up.

Once you have K8s running then shell or ssh into the Multipass container that is
running K8s and continue with these instructions.

Clone the [juju-dashboard-charm
repo](https://github.com/canonical/juju-dashboard-charm).

```shell
git clone git@github.com:canonical/juju-dashboard-charm.git
cd juju-dashboard-charm
```

Then follow the instructions to [build and
deploy](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-k8s-charm)
the Kubernetes charm and finally, follow the [QA steps](#qa-steps).

### QA steps

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

The first step before releasing the dashboard is to follow the [QA
instructions](#qa). This is a good time to do a really thorough QA and pause and fix any issues you
find so that you don't have to restart the release process.

Next, update the dashboard with the next version, following the
[SemVer](https://semver.org/) rules.

```
yarn version [major|minor|patch]
```

Create a PR and land the version update.

Now get a fresh copy of the dashboard:

```shell
git clone git@github.com:canonical/juju-dashboard.git
cd juju-dashboard
```

Install the dependencies and build the dashboard package:

```shell
yarn install
yarn generate-release-tarball
```

Now create a [new release on
GitHub](https://github.com/canonical/juju-dashboard/releases/new) with the
following details:

You should create a new tag for the release using the same version that was
set in your package.json.

Set the title to the same version number.

Attach the release tarball that you created earlier.

Click the 'Generate release notes' button to show changes since the last release
and create a full changelog link, but rewrite the changes to help them make
sense to consumers of the library.

Create the release notes using the following template:

```markdown
## Breaking changes:

-

## New features:

-

## Improvements:

-

## Bug fixes:

-
```

Finally, publish the release.

## Release charms

Juju Dashboard can be deployed using a machine charm or a Kubernetes charm which both
need updating and releasing.

If you don't have access to publish the charm, ask someone on the Juju Dashboard
team to be added as a collaborator to both charms:

https://charmhub.io/juju-dashboard/collaboration
https://charmhub.io/juju-dashboard-k8s/collaboration

### Machine charm

Fork and clone the [juju-dashboard-charm
repo](https://github.com/canonical/juju-dashboard-charm).

```shell
git clone git@github.com:<your-username>/juju-dashboard-charm.git
cd juju-dashboard-charm
```

Update the dashboard to the latest release:

```shell
./scripts/update-machine-charm-dashboard.sh
```

[Build and
deploy](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-machine-charm)
the machine charm and follow the [QA steps](#qa-steps) to confirm it is working.

If you've deployed inside a Multipass container you will need access to the
dashboard from outside the container. To do this first get the dashboard machine's instance id:

```shell
juju status
```

Then, inside the multipass container add a port forward to the dashboard instance:

```shell
lxc config device add [inst-id] portforward8080 proxy listen=tcp:0.0.0.0:8080 connect=tcp:127.0.0.1:8080
```

Now create a PR to land the update dashboard package.

Next follow the [release
steps](https://github.com/canonical/juju-dashboard-charm#machine-charm) to
publish the charm to the edge channel.

[Deploy the edge machine charm](https://github.com/canonical/juju-dashboard#deploy) in a
controller and [check that the dashboard works](#qa-steps).

Finally, follow the [release
steps](https://github.com/canonical/juju-dashboard-charm#machine-charm) again to
publish the charm to either the beta or stable channel depending on whether this
release is ready for general use.

### Kubernetes charm

Fork and clone the [juju-dashboard-charm
repo](https://github.com/canonical/juju-dashboard-charm).

```shell
git clone git@github.com:<your-username>/juju-dashboard-charm.git
cd juju-dashboard-charm
```

[Build and
deploy](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-k8s-charm)
the Kubernetes charm (using the [build from
source](https://github.com/canonical/juju-dashboard-charm?tab=readme-ov-file#building-from-source)
steps to build a new Docker image with the latest dashboard code) and follow the [QA steps](#qa-steps) to confirm it is working.

If you've deployed inside a Multipass container you will need access to the
dashboard from outside the container. To do this, inside the multipass container
add a port forward to the dashboard instance:

```shell
microk8s.kubectl port-forward dashboard-0 8080:8080 --namespace=controller-micro --address=0.0.0.0
```

The K8s charm does not need to commit any changes to the repo as a
Docker image is published to Charmhub instead.

Next follow the [release
steps](https://github.com/canonical/juju-dashboard-charm#k8s-charm) to
upload the docker resource and publish the charm to the edge channel (you can
skip the checkout and docker build steps if you've just completed them in the
previous step).

[Deploy the edge K8s charm](https://github.com/canonical/juju-dashboard#deploy) in a
controller inside Kubernetes and [check that the dashboard works](#qa-steps).

Finally, follow the [release
steps](https://github.com/canonical/juju-dashboard-charm#k8s-charm) again
(skipping the image upload as you can use the previously uploaded resource) to
publish the charm to either the beta or stable channel depending on whether this
release is ready for general use.
