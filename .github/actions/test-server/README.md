# test-server
An action to create a JIMM server with real dependencies for integration test purposes.

This action requires Docker to be installed to start JIMM and its related services.

The action performs the following steps:
- Starts JIMM's docker compose test environment.
- Uses https://github.com/charmed-kubernetes/actions-operator action to start a Juju controller and connects it to JIMM.
- Ensures the local Juju CLI is setup to communicate with JIMM authenticating as a test user.

Use the action by adding the following to a Github workflow:

```yaml
  integration-test:
    runs-on: ubuntu-latest
    name: Integration testing with JIMM
    steps:
      - name: Setup JIMM environment
        uses: canonical/jimm@v3.1.7
        with:
          jimm-version: "v3.1.7"
          juju-channel: "3/stable"
          ghcr-pat: ${{ secrets.GHCR_PAT }}
```

Note that it's recommended to pin the action version to the same version as `jimm-version` to ensure the action works as expected for that specific version of JIMM.

For full details on the inputs see `action.yaml`.
