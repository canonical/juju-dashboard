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

The target workflow is determined based on a set of environment variables. These variables are loaded into the local running environment from a `.env` file using [dotenv](https://www.npmjs.com/package/dotenv).

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
| SECONDARY_USERNAME (local auth only) |            Username for secondary user            |              `John-Doe` |
| SECONDARY_PASSWORD (local auth only) |            Password for secondary user            |             `password2` |

> Note: A few things to note about the users and their credentials:
>
> 1. The admin must have `superuser` permission on the controller to create/modify/destroy any Juju object.
> 2. The secondary user is an unprivileged user that can perform tasks based on the level of access granted.

## Steps

1. Configure the `.env` based on your target workflow.
   1. The `DASHBOARD_ADDRESS` is dynamic and depends on the network address of your currently running instance.
   2. Some tests are written strictly for Juju/JIMM environments so make sure the `JUJU_ENV` is set with correct value.
2. If you are using **Multipass**, make sure all the required ports are forwarded/tunneled.
3. For **Candid** auth, it is important to be running a `static` identity provider. You can [configure](#configuring-candid) Candid for this.
4. Run the dashboard with the same auth method as the target workflow.
5. Run the tests using `yarn playwright test`

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
6. Grant test user from Candid `superuser` permission
   > Note: `user1` is provided by Candid and all Candid users are referenced with the `@external` suffix.
   ```bash
   juju grant user1@external superuser
   ```

You should now be able to run these tests locally.
