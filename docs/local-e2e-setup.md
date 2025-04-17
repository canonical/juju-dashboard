# Guide for running End-to-End tests Locally

This document lists the step-by-step guide to running the end-to-end tests locally for various available workflows of the dashboard.

**Note: this guide is intended for debugging the tests and will require a running local environment corresponding to the target workflow.**

## Workflows

Following are the workflows that these tests are intended to run for:

- Juju with LXD using local auth.
- Juju with LXD using Candid.
- Juju with MicroK8s.
- JIMM with MicroK8s.

**Note: At a time, only one type of auth flow can be run locally.**

## Environment Variables

The target workflow is determined based on a set of environment variables. These variables are loaded into the local running environment from a `.env.e2e` file using [dotenv](https://www.npmjs.com/package/dotenv).

You can create a `.env.e2e.local` file and override environment variables from
the `.env.e2e` file. The `.env.e2e.local` file will be ignored by git.

Following is the list of required environment variables:

| Name                                 |                    Description                    |             Base Values |
| ------------------------------------ | :-----------------------------------------------: | ----------------------: |
| CONTROLLER_NAME                      |   The name of currently bootstrapped controller   |                  `test` |
| DASHBOARD_ADDRESS                    | The address of your running instance of dashboard |                       - |
| PROVIDER                             |      The cloud provider of your environment       |  `localhost`/`microk8s` |
| JUJU_ENV                             |    Whether this is a Juju or JIMM environment     |           `juju`/`jimm` |
| AUTH_MODE                            |      This determines the authentication flow      | `local`/`candid`/`oidc` |
| ADMIN_USERNAME (local auth only)     |                 Admin's username                  |                 `admin` |
| ADMIN_PASSWORD (local auth only)     |                 Admin's password                  |             `password1` |

> [!note]
> The admin must have `superuser` permission on the controller to create/modify/destroy any Juju object.

## Steps

1. Configure `.env.e2e.local` based on your target workflow.
   1. The `DASHBOARD_ADDRESS` is dynamic and depends on the network address of your currently running instance.
   2. Some tests are written strictly for Juju/JIMM environments so make sure the `JUJU_ENV` is set with correct value.
2. If you are using **Multipass**, make sure all the required ports are forwarded/tunneled.
3. For **Candid** auth, it is important to be running a `static` identity provider. You can [configure](#configuring-candid) Candid for this.
4. Run the dashboard with the same auth method as the target workflow.
5. Run the tests using `yarn playwright test`

## Accessing Playwright UI

If you are running Playwright inside a Multipass container you can use the
following steps to access the UI from your host's browser.

Firstly, you will need to access the UI from `localhost` otherwise your browser
will block the service workers. To do this, port forward from localhost to the
multipass container:

```bash
ssh -L :8080:0.0.0.0:8080 ubuntu@<multipass.ip>
```

Now run Playwright, exposing it to the host:

```bash
yarn playwright test --ui-host=0.0.0.0 --ui-port=8080
```

Now you can view the Playwright UI at http://localhost:8080.

> [!note]
> To access Playwright UI from within a GitHub Action, a service such as https://localhost.run
> will be needed. Access the action with [tmate](https://github.com/mxschmitt/action-tmate), start
> playwright (`yarn playwright test --ui-port 1234`), then share the port
> (`ssh -R 80:localhost:1234 no-key@localhost.run`).

## Configuring Candid

**Note: This must be done before `juju bootstrap`**

1. Open the configuration file located at `/var/snap/candid/current/config.yaml`
2. Make a note of the `public-key` property
3. Modify the value of `location` from "http://candid.lxd:8081" to "http://127.0.0.1:8081"
4. Reload the configuration
   ```bash
   snap restart candid
   ```
5. Bootstrap your controller
   ```bash
   juju bootstrap localhost test --config identity-url=http://127.0.0.1:8081 --config allow-model-access=true --config identity-public-key=<public-key-from-step-2>
   ```

You should now be able to run these tests locally.
