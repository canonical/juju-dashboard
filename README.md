<div align="center">

# Juju Dashboard

## View the real-time status of your [Juju](https://juju.is) or [JAAS](https://jaas.ai/) environment.

<br />

[![codecov](https://codecov.io/github/canonical/juju-dashboard/branch/main/graph/badge.svg?token=jpxOQiONwS)](https://codecov.io/github/canonical/juju-dashboard)
[![Licence: LGPLv3](https://img.shields.io/badge/License-LGPL_v3-blue.svg)](/LICENSE.md)

<br />

![Juju Dashboard](/docs/images/dashboard.png)

</div>

<br />

Juju Dashboard displays your controllers and models, allowing you to see the
status of your deployments, manage access, run actions and configure
applications. The dashboard can be used with your local Juju environments and
can also be found as a part of [JAAS](https://jaas.ai/).

## Deploy

Juju Dashboard can be deployed in your controller model using either the [VM charm](https://charmhub.io/juju-dashboard)
or [Kubernetes charm](https://charmhub.io/juju-dashboard-k8s) (pre Juju 3.0
controllers included Juju Dashboard automatically).

To deploy the dashboard, first switch to the controller model:

```shell
juju switch controller
```

Next deploy the charm. For VM deployments run:

```shell
juju deploy juju-dashboard dashboard
```

For Kubernetes deployments run:

```shell
juju deploy juju-dashboard-k8s dashboard
```

Then integrate the controller and the dashboard:

```shell
juju integrate dashboard controller
```

Finally, expose the dashboard:

```shell
juju expose dashboard
```

Now you can access the dashboard by running:

```shell
juju dashboard
```

This command will open a connection to the dashboard output the dashboard address and
credentials.

For further details see the docs on [managing the dashboard](https://juju.is/docs/olm/manage-the-juju-dashboard).

## Docs

Learn more about the Juju Dashboard in the [Juju
docs](https://juju.is/docs/olm/the-juju-dashboard).

If you're new to Juju you may also like to take a look at the [getting
started](https://juju.is/docs/olm/get-started-with-juju) docs.

If you think there's something that needs documenting or an issue with the
current docs let us know either via the [community](#community) or [file an issue](#issues).

## Community

Whether you need help, have suggestions or want to get in contact for any reason you can join us in the [Juju
Discourse](https://discourse.charmhub.io/) or find us on
[Mattermost](https://chat.charmhub.io/landing#/charmhub/channels/juju).

## Issues

If you've found a bug then please let us know by filing an issue. If you're not sure if it's a
bug you can [discuss the issue](#community) with us first.

Juju Dashboard integrates with a number of parts of the Juju ecosystem. Filing
bugs for the relevant codebase will help the issue to be seen by the right team:

- Issues with [Juju Dashboard](https://github.com/canonical/juju-dashboard/issues/new/choose).
- Issues with the [Dashboard VM or K8s charm](https://github.com/canonical/juju-dashboard-charm/issues/new).
- Issues with [Juju](https://bugs.launchpad.net/juju/+filebug) itself or its APIs.
- Issues with the [jaas.ai website](https://github.com/canonical/jaas.ai/issues).
- Issues with the [juju.is website](https://github.com/canonical/juju.is/issues/new).

## Contributing

Juju Dashboard is [open source](#licence) and we welcome contributions. Take
a look at the [contribution guide](/docs/CONTRIBUTING.md) guide to find out how
to contribute to the project.

## Development

Juju dashboard is built using a number of open source tools including [React](https://github.com/facebook/react),
[Redux Toolkit](https://github.com/reduxjs/redux-toolkit) and [TypeScript](https://github.com/microsoft/TypeScript) as well as some internal
libraries, such as [Jujulib](https://github.com/juju/js-libjuju), [bakeryjs](https://github.com/juju/bakeryjs), [Vanilla
Framework](https://github.com/canonical/vanilla-framework), [Vanilla React
Components](https://github.com/canonical/react-components) and last but not
least [Juju](https://github.com/juju/juju).

To get started working on the dashboard take a look at our [development guide](/docs/HACKING.md).

## Release

Check out the [release guide](/docs/RELEASING.md) for details about how to
release Juju Dashboard and its dependencies.

## Licence

Juju Dashboard is licensed under the [LGPLv3](/LICENSE.md) by [Canonical
Ltd](http://canonical.com/).

<hr />
<br />

Want to work on projects like this? We're
[hiring](https://canonical.com/careers)!

With ♥ from Canonical
