# Debugging cloud-init dashboard setups

The cloud-init scripts in [`scripts/`](../scripts/) provision a full dashboard development environment. When a run fails or the dashboard is inaccessible, check these areas.

## 1. Check the cloud-init run

Cloud-init runs every command in the YAML `runcmd` section. Confirm it completed before looking elsewhere.

```bash
# Check whether cloud-init considers the run successful.
cloud-init status --long

# Full output of every runcmd.
sudo tail -n 200 /var/log/cloud-init-output.log
```

## 2. Inspect service logs

Both JIMM and the dashboard run as systemd services.

```bash
# Dashboard dev server logs.
sudo journalctl -u juju-dashboard.service -f

# JIMM unit logs (will be sparse).
sudo journalctl -u jimm.service -f

# The systemd unit only restarts the compose project, so use docker compose logs for details.
cd /home/ubuntu/jimm
docker compose --profile dev logs jimm -f
```

The dashboard unit sources `nvm` then runs `yarn start` from `/home/ubuntu/juju-dashboard`. If the Node/Yarn toolchain is missing, `nvm` or `corepack` failed earlier.

## 3. Verify the dashboard process

This step is not required if using port forwarding, and relying on a Juju dashboard instance outside the container.

```bash
# Confirm port 8036 is listening.
netstat -tlnp | grep 8036

# Or check the Node process directly.
ps aux | grep "yarn start" | grep -v grep
```

If port 8036 is not bound, `yarn start` has exited. See the service logs.

## 4. Validate controller state

For **JIMM-based** setups (`jimm-lxd-oidc`, `jimm-k8s-oidc`):

```bash
# JIMM containers should be running.
cd /home/ubuntu/jimm
docker compose --profile dev ps

# Check the controllers registered with JIMM.
juju switch jimm-dev
juju controllers
juju models
```

JIMM needs one restart after the first compose startup to recover `ListModels`. The cloud-init script already does this; if JIMM still acts strangely, restart it manually:

```bash
docker restart jimm
```

For **Juju-based** setups (`juju-lxd-local`, `juju-microk8s-local`, `juju-lxd-candid`):

```bash
juju status
juju controllers
```

## 5. Check dashboard controller reachability

The dashboard connects to the controller over WebSocket. The cloud-init scripts configure the URL via `python3 charms/k8s-charm/src/config.py` using these variables:

- `DASHBOARD_CONTROLLER_URL` (e.g. `ws://jimm.localhost:17070`, `wss://<hostname>.local:17070`)
- `DASHBOARD_IS_JUJU` (`true` for Juju, `false` for JIMM)

Regenerate the dashboard config after changing any of these values:

```bash
cd /home/ubuntu/juju-dashboard
DASHBOARD_CONFIG_NAME=config.local.js \
DASHBOARD_IS_JUJU=false \
WRITE_NGINX=false \
DASHBOARD_CONFIG_DIR=/home/ubuntu/juju-dashboard/charms/k8s-charm/src \
DASHBOARD_ROOT=/home/ubuntu/juju-dashboard/public \
DASHBOARD_CONTROLLER_URL="ws://jimm.localhost:17070" \
DASHBOARD_ANALYTICS_ENABLED=false \
python3 ./charms/k8s-charm/src/config.py
```

Then restart the dashboard service or re-run `yarn start` to load the new `config.local.js`.

## 6. DNS and mDNS resolution

Most scripts rely on `.local` names resolving from both the VM and the host, so ensure that it resolves.

```bash
# From inside the VM.
hostname
hostname -f
ping -c 1 $(hostname).local

# From the host.
ping -c 1 <vm-name>.local
```

## 7. Multipass port forwards

If the dashboard runs in a Multipass VM but is not reachable from the host, forward the required ports. The MOTD shows the suggested forwards when you log in:

```bash
cat /run/motd.dynamic
```

For JIMM OIDC setups the typical forwards are:

```bash
ssh -A -L :8082:<hostname>.local:8082 \
    -L :443:<hostname>.local:443 \
    -L :17070:<hostname>.local:17070 \
    ubuntu@<hostname>.local
```

Alternatively, use the IP from `multipass list` instead of `<hostname>.local`.

## 8. Common failures

### Toolchain / Node / Yarn
- `nvm install 22` and `npm install -g corepack` run as the `ubuntu` user. Running dashboard commands as another user will not find Node/Yarn.
- In a new shell, run `source /home/ubuntu/.nvm/nvm.sh` before `yarn`.

### Docker / LXD networking (JIMM LXD OIDC)
- Docker iptables rules can block LXD traffic. The script adds forward rules for `lxdbr0`:

  ```bash
  sudo iptables -I FORWARD -i lxdbr0 -j ACCEPT
  sudo iptables -I FORWARD -o lxdbr0 -j ACCEPT
  ```

- The script also sets `ip-forward-no-drop` in Docker's `daemon.json` so Docker does not drop forwarded LXD packets. If the LXD controller is unreachable, check these rules.

### MicroK8s permissions (JIMM K8s OIDC)
- The `ubuntu` user must be in the `snap_microk8s` group. The script adds the user, but group membership only takes effect after a new login. Run `newgrp snap_microk8s` or log out and back in.
- The setup does not enable the MicroK8s ingress addon because it conflicts with JIMM's Docker networking.

### JIMM CORS / dashboard URL mismatch
- JIMM must know the dashboard origin. The script sets three environment variables in `jimm/docker-compose.common.yaml`:
  - `JIMM_DASHBOARD_FINAL_REDIRECT_URL`
  - `JIMM_DASHBOARD_LOCATION`
  - `CORS_ALLOWED_ORIGINS`
- If you change the dashboard port or hostname, update these and restart JIMM.

### Playwright on Ubuntu 24.04 ARM64
- On `aarch64` the script sets `PLAYWRIGHT_HOST_PLATFORM_OVERRIDE=ubuntu24.04-arm64` before installing browsers; on x64 it uses `ubuntu24.04-x64`. If browser downloads fail, check the override and the Playwright issue linked in the script comments.

### Authentication setup
- For OIDC/Keycloak the script runs `npx tsx .github/actions/setup-jimm/cli-login.ts`. Check that `AUTH_VARIANT`, `CONTROLLER_NAME`, `USERNAME`, and `PASSWORD` match the JIMM configuration.
- For local auth the default credentials are `admin` / `password1`.

## 9. Re-run parts of the setup

Cloud-init cannot be re-run after boot. After fixing the underlying issue, run the relevant part of the shell script manually as the `ubuntu` user:

```bash
su - ubuntu
cd /home/ubuntu/juju-dashboard/scripts
# Run only the part that failed, e.g. the dashboard setup commands.
```
