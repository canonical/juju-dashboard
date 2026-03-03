# Developing Juju Dashboard

Juju Dashboard is a JavaScript application built with [React](https://github.com/facebook/react),
[Redux Toolkit](https://github.com/reduxjs/redux-toolkit) and
[TypeScript](https://github.com/microsoft/TypeScript). Being familiar with those
tools will help when developing the dashboard.

If you haven't already read the [contribution guide](/CONTRIBUTING.md) then
that is a good place to start as it will give you an overview of how to
contribute and what kinds of contributions are welcome.

**In this document:**

- [Developing Juju Dashboard](#developing-juju-dashboard)
  - [Setting up the dashboard for development](#setting-up-the-dashboard-for-development)
    - [Multipass cloud init scripts](#multipass-cloud-init-scripts)
    - [Developing on your host](#developing-on-your-host)
      - [Configure JIMM for localhost](#configure-jimm-for-localhost)
      - [Dashboard setup](#dashboard-setup)
    - [Dotrun vs Yarn](#dotrun-vs-yarn)
    - [Controller configuration](#controller-configuration)
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
  - [Deployed JIMM controller](#deployed-jimm-controller)
    - [Adding users](#adding-users)
    - [Self signed certificates](#self-signed-certificates)
    - [Juju on M1 Macs](#juju-on-m1-macs)
  - [Building the Docker image](#building-the-docker-image)
  - [Deployment configuration guides](#deployment-configuration-guides)
    - [Deploying a local app](#deploying-a-local-app)
    - [Setting up cross model integrations](#setting-up-cross-model-integrations)
    - [Getting models into a broken state](#getting-models-into-a-broken-state)

## Setting up the dashboard for development

To get started working on the dashboard you will need to set up a local
development environment and you will also need access to a Juju controller.

### Multipass cloud init scripts

The easiest way to get set up is to use Multipass with a cloud init script that will set up the dashboard and a
Juju controller.

The following cloud init scripts are available:

| Environment | Juju version | Auth                      | Platform      | Script                                                                                                                                                                                                                       |
| ----------- | ------------ | ------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Juju        | 3.6          | Local (username/password) | Machine (LXD) | `multipass launch --cpus 2 --disk 15G --memory 8G --name juju-lxd-local --timeout 1800 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-juju-lxd-local.yaml`       |
| Juju        | 4.0          | Local (username/password) | Machine (LXD) | `multipass launch --cpus 2 --disk 15G --memory 8G --name juju-4-lxd-local --timeout 1800 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-juju-4.0-lxd-local.yaml` |
| Juju        | 3.6          | Local (username/password) | K8s           | `multipass launch --cpus 2 --disk 15G --memory 8G --name juju-k8s-local --timeout 1800 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-juju-microk8s-local.yaml`  |
| Juju        | 3.6          | Candid                    | Machine (LXD) | `multipass launch --cpus 2 --disk 15G --memory 8G --name juju-lxd-candid --timeout 1800 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-juju-lxd-candid.yaml`     |
| JIMM        | 3.6          | OIDC                      | K8s           | `multipass launch --cpus 2 --disk 25G --memory 12G --name jimm-k8s-oidc --timeout 5000 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-jimm-k8s-oidc.yaml`        |
| JIMM        | 3.6          | OIDC                      | Machine (LXD) | `multipass launch --cpus 2 --disk 25G --memory 12G --name jimm-lxd-oidc --timeout 5000 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-jimm-lxd-oidc.yaml`        |

After you have chosen an environment to work in then launch the multipass container using the command from the above table.

For example, to use Juju, LXD and local auth you could run:

```
multipass launch --cpus 2 --disk 15G --memory 8G --name juju-lxd-local --timeout 1800 --cloud-init https://raw.githubusercontent.com/canonical/juju-dashboard/refs/heads/main/scripts/cloud-init-juju-lxd-local.yaml
```

**Note: some of these environments can take a long time to launch.**

Once complete you can enter the container e.g. `multipass shell juju-lxd-local` which will display a message with
instructions on the address to connect to, the credentials and any additional set up instructions (e.g. for
JIMM environments some additional SSH port forwards are required).

If you are developing the dashboard using the codebase inside the Multipass you will probably want to run the dev server manually, in which case you can disable the service with `sudo systemctl stop juju-dashboard.service && sudo systemctl disable juju-dashboard.service`.

The dashboard can then be run with `cd ~/juju-dashboard && yarn start`.

### Developing on your host

Juju Dashboard can be run on your host and can connect to the Juju controller inside the Multipass.

#### Configure JIMM for localhost

For JIMM, an additional step is required to allow access from the dashboard running on localhost.

Update the JIMM config inside the Multipass running JIMM:

```shell
DASHBOARD_ADDRESS=http://localhost:8036
COMPOSE_CONFIG=/home/ubuntu/jimm/docker-compose.common.yaml
yq -i ".services.jimm-base.environment.JIMM_DASHBOARD_FINAL_REDIRECT_URL = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG
yq -i ".services.jimm-base.environment.JIMM_DASHBOARD_LOCATION = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG
yq -i ".services.jimm-base.environment.CORS_ALLOWED_ORIGINS = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG
```

Now you can restart the Multipass container or running the following commands to reload the Docker environment

```shell
cd /home/ubuntu/jimm && INSECURE_SECRET_STORAGE=true docker compose --profile dev up -d && docker restart jimm && juju show-controller qa-lxd | yq '.[].controller-machines.[].instance-id' | xargs lxc restart
```

#### Dashboard setup

First, install [Node.js](https://nodejs.org/) (>= v18) and
[Yarn](https://yarnpkg.com/) (>= v2) if they're not installed already.

On Ubuntu you can install Node.js with:

```shell
sudo snap install node --classic
```

On macOs, Node.js can be [installed via the instructions](https://nodejs.org/en/download/package-manager#macos).

Next, follow the [Yarn install
instructions](https://yarnpkg.com/getting-started/install).

### Dotrun vs Yarn

To use the dashboard with [Dotrun](https://github.com/canonical/dotrun) just replace `yarn ...` commands with `dotrun ...`.

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

Next you can move on to [configuring](#controller-configuration) a Juju controller to use with the dashboard.

### Controller configuration

If you set up your Juju controller using the cloud init scripts you can copy the config.local.js from inside the Multipass e.g. `cat ~/juju-dashboard/public/config.local.js`.

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

Once set up you might like to take a look at our [codebase overview and development guidelines](#codebase-and-development-guidelines).

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

## Deployed JIMM controller

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

#### Adding users

The QA deployment uses Keycloak to manage users. The deployment includes a web
UI which can be found at http://keycloak.localhost:8082/.

Log in using `jimm` and `jimm` and go to the
[jimm](http://keycloak.localhost:8082/admin/master/console/#/jimm/) realm
(switch realms using the dropdown at the top of the sidebar).

Go to [Users](http://keycloak.localhost:8082/admin/master/console/#/jimm/users) and then [Add user](http://keycloak.localhost:8082/admin/master/console/#/jimm/users/add-user).

Fill in the username and email, set 'Email verified' to 'yes' and submit the
form.

On the user details page click on the 'Credentials' tab and set a password.

You can now give the user access in all the normal ways such as `juju
grant-cloud [user@email] add-model localhost` and you can log in as the user with `juju
login` and enter the details you set above.

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
charm](https://charmhub.io/juju-dashboard-k8s) and is uploaded as a
[resource in
Charmhub](https://charmhub.io/juju-dashboard-k8s/resources/dashboard-image).
There is a full guide for building the Docker image and Kubernetes charm
[here](/docs/building-charms.md#building-and-testing-the-k8s-charm)
repo.

The Dockerfile is also used by the PR demo service which builds a Docker image
and deploys it to display a running version of a branch.

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
used for the [dashboard charms](/charms).

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
