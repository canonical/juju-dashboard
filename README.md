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

## Getting started

Assuming you already have [Docker](https://www.docker.com/) installed, you can simply run;

```
./run
```

...and view the site locally at: http://localhost:8036/

## Developing the dashboard

To start development with the dashboard follow the [Getting started](#geting-started) instructions and any changes to the code will be auto built and the browser refreshed.

### To run the tests.

```
./run test
```

### Generating a release for Juju

```
./run exec yarn run generate-release-tarball
```

### Accessing a lxd bootstrapped Dashboard that's also within a `multipass` VM

When you want to access a dashboard that was automatically installed with a `juju bootstrap` within an lxd in a `multipass` vm from the host.

- [Create a ssh tunnel](#creating-a-tunnel-from-an-lxd-controller-to-a-multipass-host)
- In the host
  - `multipass info <vm name> | grep IPv4` and take note of the IP address.
  - In your browser visit `http://<that ip>:17070`
  - Log in using the credentials provided from the `juju dashboard` command.

### Accessing a local bootstrapped controller from a hosted Dashboard.

When you have a Juju controller bootstrapped in an lxd within a `multipass` vm and a dashboard being hosted from the same `multipass` vm but accessed from the host.

- [Create a ssh tunnel](#creating-a-tunnel-from-an-lxd-controller-to-a-multipass-host)
- In the host
  - `multipass info dev | grep IPv4` and take note of the IP address.
  - Open `config.js` and modify the following values:
    - 'baseControllerURL`should be output from the`multipass info`call above with the port`17070`.
    - `identityProviderAvailable` to `false`.
    - `isJuju` to `true`.

### Creating a tunnel from an lxd controller to a `multipass` host.

If you're bootstrapping a Juju controller within a `multipass` VM you will not have access to the dashboard from the host because there is no network path to it. To create a tunnel to access the dashboard follow these steps.

- After bootstrapping a controller on `lxd` in your `multipass` VM...
- In the multipass vm
  - `juju switch controller && juju ssh 0`
- In the lxd container
  - `ssh-import-id <your launchpad name>`
- In the multipass vm
  - `juju dashboard` and take note of the ip:port
  - `ssh -fN -L *:17070:0:17070 ubuntu@10.223.241.32` Where the "10." ip is replaced with the ip from the output of the `juju dashboard` command.

### Updating CRA

When updating Create React App it's important to take a look at the `optimization.minimizer` values in the webpack config and then update the config in `craco.config.js`. After copying over any updates be sure to re-introduce the `terserOptions.mangle.reserved` key and values in the newly updated config.
