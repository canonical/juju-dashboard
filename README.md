# Juju Dashboard

The dashboard to monitor your [Juju](https://juju.is) & [JAAS](https://jaas.ai) environments.

Starting with Juju 2.8 this dashboard is installed by default with every bootstrap. To access it simply run `juju dashboard` and visit the link provided and log in using the supplied credentials. It's also available and automatically updated for users of JAAS on [jaas.ai](jaas.ai/models).

## Using the Dashboard with Juju

Below are the commands you can use to interact with the dashboard from Juju 2.8+

usage: `juju <command>`

<!-- prettier-ignore-start -->
| command | description |
| --- | --- |
| dashboard | Outputs the Juju Dashboard URL, username and password. <br>The password will only be shown if you haven't changed it from its default. |
| upgrade-dashboard | Upgrade to a new released Juju Dashboard version. <br>A file path to a tarball can be provided to switch to a custom version. |
<!-- prettier-ignore-end -->

see `juju help <command>` for detailed option output.

## QA'ing the Dashboard

The Juju Dashboard is run in a number of different environments that distill down to two different backends, Juju and JAAS. A thorough QA will test the new features in both environments.

For both environments you'll want to pull down the code locally from the appropriate pull request.

```
git clone git@github.com:canonical-web-and-design/jaas-dashboard.git
git checkout -b branch-name-for-the-pr master
git pull git://github.com/<pr creators username>/jaas-dashboard.git <pull request branch name>
```

### In Juju

#### Uploading the a tarball to a Juju controller

This is the preferred approach as it's served by Juju itself which is also generating the configuration files so it's the closest to a production environment.

```
./run exec yarn run generate-release-tarball
juju upgrade-dashboard juju-dashboard-<version>.tar.bz2
juju dashboard
```

And connect to the Dashboard from your browser using the supplied details.

#### Connecting a local dashboard to a remote controller

If you'd like to run the Dashboard locally and connect to a remote controller
see [Developing while connected to a Juju controller](#developing-while-connected-to-a-juju-controller)

### In JAAS

The default configuration setting for the Dashboard is to connect to public JAAS so you can simply:

```
./run
```

Then connect to the Dashboard from your browser at http://localhost:8036/.

## Developing the Dashboard

Assuming you already have [Docker](https://www.docker.com/) installed, you can simply run;

```
./run
```

...and view the site locally at: http://localhost:8036/. Any changes you make to the code will be automatically recompiled and reloaded in the browser.

### Developing while connected to a Juju controller

Assuming you already have a [Juju controller created](https://juju.is/docs/getting-started-with-juju) you will need to connect to the existing controller and accept the self-signed certificate. Without this step your local dashboard will not be permitted to complete the required secure websocket connection to the controller.

- Run `juju dashboard` and view the Dashboard using the supplied url.
  - Accept the self-signed cert
- Open `config.js` and modify the following values:
  - `baseControllerURL` should be output from the `juju dashboard` call above with the port `17070`.
  - `identityProviderAvailable` to `false`.
  - `isJuju` to `true`.
- Start the Dashboard with `./run`.
- You can now access the dashboard at http://localhost:8036/ and it'll require the log in credentials from the above `juju dashboard` command.

### Running the tests.

```
./run test
```

### Generating a release tarball for Juju

```
./run exec yarn run generate-release-tarball
```

### Accessing the dashboard from nested containers

#### A lxd bootstrapped Dashboard that's also within a `multipass` VM

When you want to access a dashboard that was automatically installed with a `juju bootstrap` within an lxd in a `multipass` vm from the host.

- [Create a ssh tunnel](#creating-a-tunnel-from-an-lxd-controller-to-a-multipass-host)
- In the host
  - `multipass info <vm name> | grep IPv4` and take note of the IP address.
  - In your browser visit `http://<that ip>:17070`
  - Log in using the credentials provided from the `juju dashboard` command.

#### A local bootstrapped controller from a hosted Dashboard.

When you have a Juju controller bootstrapped in an lxd within a `multipass` vm and a dashboard being hosted from the same `multipass` vm but accessed from the host.

- [Create a ssh tunnel](#creating-a-tunnel-from-an-lxd-controller-to-a-multipass-host)
- In the host
  - `multipass info dev | grep IPv4` and take note of the IP address.
  - Open `config.js` and modify the following values:
    - `baseControllerURL` should be output from the `multipass info` call above with the port `17070`.
    - `identityProviderAvailable` to `false`.
    - `isJuju` to `true`.

#### Creating a tunnel from an lxd controller to a `multipass` host.

If you're bootstrapping a Juju controller within a `multipass` VM you will not have access to the dashboard from the host because there is no network path to it. To create a tunnel to access the dashboard follow these steps.

- After bootstrapping a controller on `lxd` in your `multipass` VM...
- In the multipass vm
  - `juju switch controller && juju ssh 0`
- In the lxd container
  - `ssh-import-id <your launchpad name>`
- In the multipass vm
  - `juju dashboard` and take note of the ip:port
  - `ssh -fN -L *:17070:0:17070 ubuntu@10.223.241.32` Where the "10." ip is replaced with the ip from the output of the `juju dashboard` command.

### Writing React components

The Juju Dashboard uses [Vanilla CSS](https://vanillaframework.io/) and [Vanilla React Components](https://github.com/canonical-web-and-design/react-components). Be sure to check there first for any components before writing your own.

#### React component conventions

- Components are stored in their own self-named folders using the TitleCase format.
- Tests and Sass files are stored along side each component with the naming convention of `ComponentName.css` and `ComponentName.test.js` respectively.
- Sub components are nested within subfolders of their parent components if they are not shared among other components.
- Use functional components.
- Use hooks.
- Consider contributing generic components back to [Vanilla CSS](https://vanillaframework.io/) and [Vanilla React Components](https://github.com/canonical-web-and-design/react-components) where appropriate.
- Components can be as big as they need to be, don't split them up into micro components.
- Components either accept props or interact with the redux store via selectors, do not access data sources directly.

### Writing tests

We follow the [Testing your user contract](https://fromanegg.com/post/2020/01/01/testing-your-user-contract/) system of writing tests.

> The consumer expects that when they perform action X, they receive outcome Y. Typically they are not concerned about how X became Y just that it does so reliably.

This effectively means that we write integration and component tests, not unit tests.

#### Testing conventions

- The test files are kept along side the library or component file following the naming convention `<component|filename>.test.js`.
- We limit the use of snapshots except for where the snapshot updates can be easily verified by a reviewer.
- Add assertions for the explicit content you're expecting. This allows changes to things that may not be relevant to the test like classNames, attributes, etc.
- When searching for an element, use element selectors where possible and add a data attribute when not. We follow the format of `data-test="..."` or `data-test-<specifier>="..."` ex) `<a data-test-column="priority">High</a>`.
- Test labels should be specific and representative of the test content. Create additional tests if you need assertions that do not apply to the label.
- Do not mock components unless absolutely necessary. The data dump mentioned below should contain sufficient data to render the full component tree in the test.

#### Mocking data

The file [complete-redux-store-dump.js](src/testing/complete-redux-store-dump.js) contains a sanitized redux dump from a Dashboard instance with many models in different states. When writing a test use the real data provided by this file when generating a redux store that will provide the data to your component or library. Because every test uses the same dataset this allows us to see when a library or component will fail if the data that's saved to the redux store, or a selector is modified.

> **If you modify the data that is saved into the redux store then you must update this file**

If you want to test states that are not included in the data dump, or if you want to see how a component will act in different data states you can modify it locally within the test. If you must modify some value see if there is value in adding another entry into the dataset for others to use.

#### Test Snippets

The typical import and test case setup looks like the following. Note that we create a shared `mockStore` factory at the top of each test suite.

```
import React from "react";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("ComponentName", () => {

 it('', () => {
   // test case
 });

 //... more tests

});
```

Setting up a typical component test involves creating a mock store and passing that to the Provider so that any component you're testing can still use its built-in redux selectors.

```
const store = mockStore(dataDump);
const wrapper = mount(
  <MemoryRouter>
    <Provider store={store}>
      <StatusGroup />
    </Provider>
  </MemoryRouter>
);
```

If you need to modify the data used in the application, clone the data dump in each test so that you do not run the risk of overriding data in subsequent tests. You should only update the values directly.

```
const clonedData = cloneDeep(dataDump);
clonedData.root.appVersion = "0.1.8";
const store = mockStore(clonedData);
const wrapper = mount(
  <MemoryRouter>
    <Provider store={store}>
      <StatusGroup />
    </Provider>
  </MemoryRouter>
);
```

We have a [special component](src/components/Routes/TestRoute.js) for routing to be used with testing. It ensures that the routes that are used in the test are valid within the application by comparing them to the real routes.

```
const wrapper = mount(
  <Provider store={store}>
    <MemoryRouter initialEntries={["/models/group-test"]}>
      <TestRoute path="/models/*">
        <InfoPanel />
      </TestRoute>
    </MemoryRouter>
  </Provider>
);
```

### Developer notes

#### Updating CRA

When updating Create React App it's important to take a look at the `optimization.minimizer` values in the webpack config and then update the config in `craco.config.js`. After copying over any updates be sure to re-introduce the `terserOptions.mangle.reserved` key and values in the newly updated config.
