# Developing Juju Dashboard

Juju Dashboard is a JavaScript application built with [React](https://github.com/facebook/react),
[Redux Toolkit](https://github.com/reduxjs/redux-toolkit) and
[TypeScript](https://github.com/microsoft/TypeScript). Being familiar with those
tools will help when developing the dashboard.

If you haven't already read the [contribution guide](/CONTRIBUTING.md) then
that is a good place to start as it will give you an overview of how to
contribute and what kinds of contributions are welcome.

**In this document:**

- [Setting up the dashboard for development](#setting-up-the-dashboard-for-development)
  - [Controller configuration](#controller-configuration)
  - [Dotrun vs Yarn](#dotrun-vs-yarn)
- [Codebase and development guidelines](#codebase-and-development-guidelines)
  - [Browser plugins](#browser-plugins)
  - [React](#react)
    - [Components](#components)
    - [Common files](#common-files)
    - [Pages](#pages)
    - [SCSS](#scss)
  - [Redux](#redux)
    - [Reselect](#reselect)
    - [Middleware](#middleware)
  - [TypeScript](#typescript)
  - [Testing](#testing)
    - [Test factories](#test-factories)
  - [Dashboard libraries](#dashboard-libraries)
    - [Jujulib](#jujulib)
    - [Bakeryjs](#bakeryjs)
    - [Vanilla Framework](#vanilla-framework)
    - [Vanilla React Components](#vanilla-react-components)
- [Juju controllers in Multipass](#juju-controllers-in-multipass)
  - [Juju controller](#juju-controller)
  - [Juju controller with Candid](#juju-controller-with-candid)
  - [Deployed JIMM controller](#deployed-jimm-controller)
  - [Local JIMM controller](#local-jimm-controller)
    - [Set up JIMM](#set-up-jimm)
    - [Forward ports](#forward-ports)
    - [Set up Juju Dashboard](#set-up-juju-dashboard)
    - [Restarting JIMM](#restarting-jimm)
  - [Self signed certificates](#self-signed-certificates)
  - [Juju on M1 Macs](#juju-on-m1-macs)
- [Building the Docker image](#building-the-docker-image)
- [Deployment configuration guides](#deployment-configuration-guides)
  - [Deploying a local app](#deploying-a-local-app)
  - [Setting up cross model integrations](#setting-up-cross-model-integrations)
  - [Getting models into a broken state](#getting-models-into-a-broken-state)

## Setting up the dashboard for development

To get started working on the dashboard you will need to set up a local
development environment and you will also need access to a Juju controller (JAAS may be
sufficient to get started).

Once set up you might like to take a look at our [codebase overview and development guidelines](#codebase-and-development-guidelines).

If you want to you can set up the dashboard inside a
[Multipass](https://multipass.run) container. This will provide a clean
development environment. If you choose to use a Multipass container then `launch`
your container and `shell` into it and continue from there.

```
multipass launch --cpus 2 --disk 15G --memory 8G --name dev
multipass shell dev
```

First, install [Node.js](https://nodejs.org/) (>= v18) and
[Yarn](https://yarnpkg.com/) (>= v2) if they're not installed already.

On Ubuntu you can install Node.js with:

```shell
sudo snap install node --classic
```

On macOs Node.js can be [installed via the instructions](https://nodejs.org/en/download/package-manager#macos).

Next, follow the [Yarn install
instructions](https://yarnpkg.com/getting-started/install).

Now you will need to get a copy of the dashboard. Go to the [dashboard
repo](https://github.com/canonical/juju-dashboard), login and fork it.

Now clone your fork:

```shell
git clone https://github.com/<your-username>/juju-dashboard.git
cd juju-dashboard
```

Install the dependencies

```shell
yarn install
```

Then start the dashboard with:

```shell
yarn start
```

Next you can move on to configuring a Juju controller to use with the dashboard.

### Controller configuration

To configure the controller used by Juju Dashboard, create a local config file:

```
cp public/config.js public/config.local.js
```

Update `controllerAPIEndpoint` to the address of your controller. When using a
controller inside a multipass you can get the IP address using `multipass list`
then set the endpoint to:

```shell
controllerAPIEndpoint: "wss://[controller.ip]:17070/api",
```

To use a local/non-JAAS controller you will need to set:

```shell
isJuju: true,
```

Don't forget to [accept the self signed certificate](#self-signed-certificates)
for the controller.

### Dotrun vs Yarn

To use the dashboard with [Dotrun](https://github.com/canonical/dotrun) just replace `yarn ...` commands with `dotrun ...`.

## Codebase and development guidelines

### Browser plugins

Both the [React dev tools](https://react.dev/learn/react-developer-tools) and
[Redux dev tools](https://github.com/reduxjs/redux-devtools) are useful when
developing Juju Dashboard.

### React

Juju Dashboard uses [React](https://react.dev/) for its component based UI.

#### Components

Use [function
components](https://react.dev/learn/your-first-component#defining-a-component)
and [hooks](https://react.dev/reference/react) over class based components.

It is recommended to have one component per file, and one component per
directory. A typical component directory will have the structure:

- `_component.scss` (any SCSS specific to this component)
- `Component.tsx` (the component itself)
- `Component.test.tsx` (tests specific to this component)
- `index.tsx` (export the component from this file)

#### Common files

Where possible write reusable code which should live in the top level
directories e.g. `src/components`, `src/hooks`.

#### Pages

Distinct views of the app live in the `src/pages` directory. These will usually equate to the
top level routes.

#### SCSS

Shared SCSS should live in the `src/scss` directory, but SCSS specific to a page
or component should live in the component's directory and be imported inside the
component.

### Redux

Juju Dashboard uses [Redux](https://redux.js.org/) and [Redux
Toolkit](https://redux-toolkit.js.org/).

Redux code lives in `src/store`. The code is structured by
["slice"](https://redux-toolkit.js.org/usage/usage-guide#creating-slices-of-state),
equivalent to a top level key of Redux state.

Each slice contains, the slice creator, selectors, TypeScript types and tests
for that slice of state.

#### Reselect

Fetching data from the Redux store inside a component is done via
[Reselect](https://github.com/reduxjs/reselect).

#### Middleware

There are two pieces of middleware:

- `src/store/middleware/check-auth.ts` is used to gate authentication for
  requests to the Juju APIs.
- `src/store/middleware/model-poller.ts` is used to make WebSocket connections
  to the Juju APIs.

### TypeScript

Juju Dashboard is written in TypeScript. Wherever possible strict TypeScript
should be used.

### Testing

The dashboard is unit tested and interaction tested using [Vitest](https://vitest.dev/) and [React
Testing Library](https://testing-library.com/).
The dashboard is end-to-end tested using [Playwright](https://playwright.dev/). Learn more about running the end-to-end tests locally [here](/docs/local-e2e-setup.md).

#### Test factories

The dashboard uses test factories instead of data dumps to allow each test to
declare the data required for it to pass.

Test factories are written using
[Fishery](https://github.com/thoughtbot/fishery) and live in
`src/testing/factories`.

The factories are set up in files that equate to the Juju facade that the data
is returned from.

### Dashboard libraries

Juju Dashboard makes use of a few external libraries that are built and
maintained by Canonical.

#### Jujulib

[Jujulib](https://github.com/juju/js-libjuju) is a core library for Juju
Dashboard. This library provides a JavaScript client for interacting
with the Juju WebSocket APIs and also provides TypeScript types for the API and
underlying models.

#### Bakeryjs

[Bakeryjs](https://github.com/juju/bakeryjs) implements a
[macaroon](http://theory.stanford.edu/~ataly/Papers/macaroons.pdf) interface in
JavaScript. This library is used to authenticate with Juju when using a
third-party identity provider.

#### Vanilla Framework

[Vanilla
Framework](https://github.com/canonical/vanilla-framework) is a CSS framework
used to provide consistency across Canonical's codebases.

#### Vanilla React Components

[Vanilla React
Components](https://github.com/canonical/react-components) is a React
implementation of Vanilla Framework and is the preferred method of consuming
Vanilla Framework elements.

## Juju controllers in Multipass

The easiest way to set up a juju controller is inside a
[Multipass](https://multipass.run) container. This allows you cleanly add and
remove controllers as necessary and provides a way to have multiple controllers
running at once (with different Juju versions if needed).

There are three main types of deployment:

- [Juju controller](#juju-controller)
- [Juju with Kubernetes](./docs/multipass-microk8s.md)
- [JIMM controller](#jimm-controller)

### Juju controller

If this controller is being created on an M1 mac then you will need to [set the
arch](#juju-on-m1-macs) when running some of the commands.

First, create a new Multipass container. You may need to adjust the resources
depending on your host machine.

```shell
multipass launch --cpus 2 --disk 15G --memory 8G --name juju jammy
```

Enter the container:

```shell
multipass shell juju
```

Install Juju:

```shell
sudo snap install juju --channel=3/stable
```

Generate SSH keys (the defaults should be fine for testing):

```shell
ssh-keygen
```

Create a local share directory ([issue](https://bugs.launchpad.net/snapd/+bug/1997598)):

```shell
mkdir -p ~/.local/share
```

Bootstrap Juju (the defaults should work fine for most cases):

```shell
juju bootstrap
```

Get the controller machine's instance id ("Inst id")

```shell
juju switch controller
juju status
```

So that the Juju API can be accessed outside the Multipass container the API
port will need to be forwarded to the controller machine. Using the instance id
from above run:

```shell
lxc config device add [inst-id] portforward17070 proxy listen=tcp:0.0.0.0:17070 connect=tcp:127.0.0.1:17070
```

To be able to authenticate as the admin you will need to set a password:

```shell
juju change-user-password admin
```

At this point you can deploy the dashboard, or skip to the next section:

```shell
juju deploy juju-dashboard dashboard
```

Then integrate the controller and the dashboard:

```shell
juju integrate dashboard controller
```

Expose the dashboard:

```shell
juju expose dashboard
```

Get the dashboard machine's instance id:

```shell
juju status
```

Then port forward to the dashboard instance so that the dashboard can be accessed
from outside the Multipass container:

```shell
lxc config device add [inst-id] portforward8080 proxy listen=tcp:0.0.0.0:8080 connect=tcp:127.0.0.1:8080
```

If you wish you can add additional models and deploy applications:

```shell
juju add-model test
juju deploy postgresql
```

Now exit the Multipass container and then run the following to get the IP
address of the container:

```shell
multipass info juju
```

If you deployed the dashboard inside the container you will be able to access it
at:

```shell
http://[container.ip]:8080/
```

If you want to use the controller with a local dashboard you can [configure
the dashboard](#controller-configuration) by setting the endpoint in
`config.local.js`:

```shell
controllerAPIEndpoint: "wss://[container.ip]:17070/api",
```

Once you're finished with the controller you can stop the Multipass container:

```shell
multipass stop juju
```

And if you no longer require the container you can remove it:

```shell
multipass delete juju
multipass purge
```

### Juju controller with Candid

First, create a new Multipass container. You may need to adjust the resources
depending on your host machine.

```shell
multipass launch --cpus 2 --disk 15G --memory 8G --name juju-candid
```

Enter the container:

```shell
multipass shell juju-candid
```

Install the prerequisites:

```shell
sudo snap install juju lxd candid
```

Initialise LXD with the default configuration:

```shell
lxd init --auto
```

Bootstrap Juju with the Ubuntu SSO provider:

```shell
juju bootstrap --config identity-url=https://api.jujucharms.com/identity --config allow-model-access=true
```

Get the controller container's instance id ("Inst id")

```shell
juju switch controller
juju status
```

So that the Juju API can be accessed outside the Multipass container the API
port will need to be forwarded to the controller machine. Using the instance id
from above, run:

```shell
lxc config device add [inst-id] portforward17070 proxy listen=tcp:0.0.0.0:17070 connect=tcp:127.0.0.1:17070
```

To be able to access the controller you will need to allow access to your SSO
user (check https://login.ubuntu.com/ if you're not sure what your username is):

```shell
juju grant [your-sso-username]@external superuser
```

If you wish you can add additional models and deploy applications:

```shell
juju add-model test
juju deploy postgresql
```

Now exit the Multipass container and then run the following to get the IP
address of the container:

```shell
multipass info juju-candid
```

You can now configure your local dashboard by setting the endpoint in
`config.local.js`:

```shell
controllerAPIEndpoint: "wss://[container.ip]:17070/api",
```

When deployed by a charm the controller relation will provide the value for
`identityProviderURL`. The actual value isn't used by the dashboard at this
time, but rather the existence of the value informs the dashboard that Candid is
available, so in `config.local.js` you just need to set the URL to any truthy value:

```shell
identityProviderURL: "/candid",
```

You also need to configure your dashboard to work with a local controller:

```shell
isJuju: true,
```

You can now access your local dashboard and log in using your Ubuntu SSO credentials.

### Deployed JIMM controller

To access the demo deployment of JIMM you need to be connected to the VPN. Note: you
don't need to be connected to the VPN until you want to connect to JIMM.

To allow the JIMM authentication to authenticate your local dashboard you need
to access the dashboard at the same address as the deployed dashboard.

First on your host machine edit your `/etc/hosts`:

```shell
nano /etc/hosts
```

Enter the dashboard hostname so that it points to localhost:

```shell
127.0.0.1      jimm-dashboard.k8s.dev.canonical.com
```

Next, if your local dashboard is deployed inside a Multipass container you will
need to port forward from localhost into your container (otherwise skip this step):

```shell
ssh -L :443:0.0.0.0:8036 ubuntu@[container.ip]
```

Now, inside your Multipass container start the server:

```shell
yarn start-jaas
```

If your local dashboard is not inside a container then you'll need to run it at
port `443` (requires `sudo`):

```shell
sudo yarn start-jaas --port 443
```

Now you can connect to the VPN and then you should be able to access the dashboard (note: https only):

https://jimm-dashboard.k8s.dev.canonical.com

### Local JIMM controller

First, create a new Multipass container. You may need to adjust the resources
depending on your host machine, but you will need to allocate at least 20GB of
disk space.

```shell
multipass launch --cpus 2 --disk 20G --memory 8G --name jimm
```

Copy your ssh key into the container. You can do this manually or use this one-liner:

```shell
cat ~/.ssh/id_[key-name].pub | multipass exec jimm -- tee -a .ssh/authorized_keys
```

SSH into the container:

```shell
ssh -A ubuntu@[multipass.ip]
```

#### Set up JIMM

Check out the JIMM repository:

```shell
git clone git@github.com:canonical/jimm.git
cd jimm
```

Start by making a small configuration change so that the login process redirects
to the development dashboard URL:

```shell
nano docker-compose.common.yaml
```

Set `JIMM_DASHBOARD_FINAL_REDIRECT_URL` and `CORS_ALLOWED_ORIGINS` to `"http://jimm.localhost:8036"`.

Next follow the first three steps in the [Starting the
environment](https://github.com/canonical/jimm/tree/v3/local#starting-the-environment)
section of the JIMM docs.

Now follow the [Q/A Using
jimmctl](https://github.com/canonical/jimm/tree/v3/local#qa-using-jimmctl)
steps.

Then you can run the LXD environment with the [`make qa-lxd`](https://github.com/canonical/jimm/tree/v3/local#all-in-one-commands) script.

_NOTE: `make qa-lxd` may not succeed on the first run._

#### Forward ports

To expose the various JIMM APIs so that they can be accessed from outside of the
Multipass container, you can use an SSH port forward. This will also enable
access to the Multipass using the hostnames set up inside the Multipass e.g.
jimm.localhost.

On Linux, ports below 1024 are privileged. The easiest way to get around this is
to port forward as root.

Start by generating SSH keys for root:

```shell
sudo ssh-keygen
```

Copy your root ssh key into the container. You can do this manually or use this one-liner:

```shell
sudo cat /root/.ssh/id_[key-name].pub | multipass exec jimm -- tee -a .ssh/authorized_keys
```

Now from your host machine run the following:

```shell
export JIMM_CONTAINER=[multipass.ip]
sudo ssh -A -L :8082:$JIMM_CONTAINER:8082 -L :17070:$JIMM_CONTAINER:17070  -L :443:$JIMM_CONTAINER:443 -L :8036:$JIMM_CONTAINER:8036 ubuntu@$JIMM_CONTAINER
```

#### Set up Juju Dashboard

Inside the JIMM Multipass, get your fork of the dashboard:

```shell
cd ~
git clone git@github.com:[your-username]/juju-dashboard.git
cd juju-dashboard
```

Install Node.js an Yarn:

```shell
sudo snap install node --classic
```

Install the dependencies:

```shell
yarn install
```

Copy the configuration file:

```shell
cp public/config.js public/config.local.js
```

Edit the file:

```shell
nano public/config.local.js
```

Change the configuration as follows:

```shell
controllerAPIEndpoint: "ws://jimm.localhost:17070/api",
```

Now you can start the dashboard with:

```shell
yarn start
```

To access the dashboard you can visit:

```shell
http://jimm.localhost:8036/
```

To log in you need to use the username and password listed in: [Controller set up](https://github.com/canonical/jimm/tree/v3/local#controller-set-up).

#### Restarting JIMM

Each time you start the multipass container you need to do the following:

1. [Forward ports](#forward-ports)
2. Recreate the JIMM environment with `make qa-lxd`.
3. Now you can start the dashboard as normal.

### Self signed certificates

The Juju controller uses a self-signed certificate for the API. To allow your
local dashboard to connect to Juju you will need to first accept this
certificate. If the dashboard is displaying a warning about not being able to
connect to the controller, this might be the reason.

To accept the certificate, first find the address of the controller. This will
be set as `controllerAPIEndpoint` in your `config.local.js` (replace `wss://`
with `https://`).

Open the address in the browser window you're using to load the dashboard.
You'll need to use https (otherwise you'll get an error `Client sent an HTTP
request to an HTTPS server.`) and include the port (usually `17070`).

The browser should now display a warning about the self signed certificate
(unless it has already been accepted, in which case it will display "Bad
Request"). Accept the certificate (this might be hidden under an advanced
toggle).

Once accepted the page will display "Bad Request". This is good! You should now
be able to log in from the dashboard.

### Juju on M1 Macs

When bootstrapping Juju or deploying apps on an M1 Mac (or other arm based
computers) then you need to specify the arch.

This can either be set on a per-model basis:

```shell
juju set-model-constraints arch=arm64
```

Or passed to the bootstrap or deploy commands:

```shell
juju bootstrap ... --constraints="arch=arm64"
juju deploy ... --constraints="arch=arm64"
```

_Note: not all charms are built for arm64 so it may be prudent to have access to
an amd64 machine for testing._

## Building the Docker image

The Docker image is used by the [Juju Dashboard Kubernetes
charm](https://github.com/canonical/juju-dashboard-charm) and is uploaded as a
[resource in
Charmhub](https://charmhub.io/juju-dashboard-k8s/resources/dashboard-image).
There is a full guide for building the Docker image and Kubernetes charm in the
[juju-dashboard-charm](https://github.com/canonical/juju-dashboard-charm#building-and-testing-the-k8s-charm)
repo.

The Dockerfile is also used by the PR demo service which builds a Docker image
and deploys it to display a running version of a branch.

If this image needs to be tested in a Kubernetes environment then you can follow
the [Multipass and Kubernetes](./docs/multipass-microk8s.md) instructions.

To build the charm you first need to install [Docker Engine](https://docs.docker.com/engine/install/ubuntu/).

Then, inside your juju-dashboard checkout run:

```shell
DOCKER_BUILDKIT=1 docker build -t juju-dashboard .
```

That's it! The Docker image has been built. To see details about the image run:

```shell
docker image inspect juju-dashboard | less
```

## Deployment configuration guides

### Deploying a local app

_Note: here we are referring to local apps to mean those that are from your local
filesystem which are listed as being from the Local store in the dashboard.
Local apps can also refer to apps that are deployed in a model as opposed to
apps that are displayed via a cross-model relation. Also, it should be noted
that these two types of local
apps are not mutually exclusive._

Charms that are on your local filesystem can be built and deployed to a model.
In this example we will use the Postgresql charm, but this process can also be
used for the [dashboard
charms](https://github.com/canonical/juju-dashboard-charm).

First, get a copy of the code:

```shell
git clone https://github.com/canonical/postgresql-operator.git
```

Enter the charm directory:

```shell
cd postgresql-operator/
```

Install charmcraft so you can build the charm:

```shell
sudo snap install charmcraft --classic
```

Build the charm with:

```shell
charmcraft pack
```

Finally, you can deploy the charm to the current model (you may wish to `juju
switch ...` to a different model or `juju add-model ...` to create a
new one):

```shell
juju deploy ./postgresql_ubuntu-*.charm
```

Now if you navigate to the model in your dashboard you should see the app in the
"Local apps" table.

### Setting up cross model integrations

Integrations can be created between applications in separate models. For further
information see the [docs](https://juju.is/docs/olm/manage-cross-model-integrations).

First, create a model to contain the application that will offer an integration:

```shell
juju add-model cmi-provider
```

Deploy an application:

```shell
juju deploy mysql
```

Offer the integration:

```shell
juju offer mysql:mysql mysql-cmi
```

Now, add a model that will be used to consume the integration:

```shell
juju add-model cmi-consumer
```

Deploy an application that can consume the `mysql` interface:

```shell
juju deploy slurmdbd
```

Get the full name of the offer:

```shell
juju find-offers
```

Finally, create the integration:

```shell
juju integrate slurmdbd:db admin/cmi-provider.mysql-cmi
```

Using the dashboard you should now see the offer listed in the cmi-provider
model and you should see the remote application in the cmi-consumer model.

### Getting models into a broken state

To get a model into a broken state you need an application to have an error.

First, deploy an application:

```shell
juju deploy nginx
```

Now set the status of the application:

```shell
juju exec --app nginx "status-set --application=True blocked 'this app is broken'"
```

If you view the model list it should now be listed in the blocked models table.

_Note: the application's units will still have a "Running" status as this is
determined by the unit's agent and workload status._

To get the model out of the broken state run:

```shell
juju exec --app nginx "status-set --application=True active"
```
