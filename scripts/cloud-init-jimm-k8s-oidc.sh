# Set up node.
cd /home/ubuntu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source /home/ubuntu/.nvm/nvm.sh
nvm install 22
# Install Yarn without requiring user input.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
npm install -g corepack

# Prepare but don't bootstrap.
cd /home/ubuntu/juju-dashboard/scripts/concierge/jimm-k8s-oidc/
sudo concierge prepare
sudo usermod -a -G snap_microk8s ubuntu
sudo chown -R ubuntu ~/.kube
# The ingress addon is deliberately not enabled as it conflicts with the JIMM docker setup.
sudo microk8s.enable hostpath-storage
sudo microk8s.enable dns
sudo microk8s.enable host-access
subnet="$(ip route get 1 | head -n 1 | awk '{print $7}' | awk -F. '{print $1 "." $2 "." $3 ".240/24"}')"
sudo microk8s enable metallb:"$subnet"

# Get JIMM and build JAAS CLI.
cd /home/ubuntu/
git clone https://github.com/canonical/jimm.git
cd /home/ubuntu/jimm
go build ./cmd/jaas

# Configure JIMM with the dashboard address.
HOSTNAME=$(hostname).local
MULTIPASS_ADDRESS=http://$HOSTNAME
DASHBOARD_ADDRESS="$MULTIPASS_ADDRESS:8036"
COMPOSE_CONFIG=/home/ubuntu/jimm/docker-compose.common.yaml
yq -i ".services.jimm-base.environment.JIMM_DASHBOARD_FINAL_REDIRECT_URL = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG
yq -i ".services.jimm-base.environment.JIMM_DASHBOARD_LOCATION = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG
yq -i ".services.jimm-base.environment.CORS_ALLOWED_ORIGINS = \"$DASHBOARD_ADDRESS\"" $COMPOSE_CONFIG

# Start JIMM
make certs
make version/commit.txt
make version/version.txt
export INSECURE_SECRET_STORAGE=true
docker compose --profile dev up --wait -d
# Restart JIMM to fix the ListModels issue.
docker restart jimm

# Set up Juju Dashboard.
cd /home/ubuntu/juju-dashboard
yarn install
export DASHBOARD_CONFIG_NAME=config.local.js
export DASHBOARD_IS_JUJU=false
export WRITE_NGINX=false
export DASHBOARD_CONFIG_DIR=/home/ubuntu/juju-dashboard/charms/k8s-charm/src
export DASHBOARD_ROOT=/home/ubuntu/juju-dashboard/public
export DASHBOARD_CONTROLLER_URL="ws://jimm.localhost:17070"
export DASHBOARD_ANALYTICS_ENABLED=false
python3 ./charms/k8s-charm/src/config.py

# Set up k8s controller
cd /home/ubuntu/juju-dashboard
yarn playwright install --with-deps --only-shell chromium
cd /home/ubuntu/jimm
sg snap_microk8s -c ./local/jimm/setup-microk8s-controller.sh
export AUTH_VARIANT=keycloak
export CONTROLLER_NAME=jimm-dev
export USERNAME=jimm-test
export PASSWORD=password
npx --yes tsx /home/ubuntu/juju-dashboard/.github/actions/setup-jimm/cli-login.ts
juju switch jimm-dev
sg snap_microk8s -c ./local/jimm/add-microk8s-controller.sh
./jaas register-controller qa-microk8s --local --tls-hostname juju-apiserver
juju update-credentials microk8s --controller jimm-dev

# Set the admin user's password:
juju switch qa-microk8s
echo password1 | juju change-user-password --no-prompt
juju switch jimm-dev
juju add-model test

# Create a service to correctly set up JIMM on restart.
sudo tee /lib/systemd/system/jimm.service <<'EOF'
[Unit]
Description=Set up JIMM
After=multi-user.target

[Service]
Type=oneshot
ExecStart=sudo -u ubuntu bash -c "cd /home/ubuntu/jimm && INSECURE_SECRET_STORAGE=true docker compose --profile dev up -d && docker restart jimm && juju show-controller qa-microk8s | yq '.[].controller-machines.[].instance-id' | xargs lxc restart"

[Install]
WantedBy=multi-user.target
EOF

# Create a service to automatically start Juju Dashboard.
sudo tee /lib/systemd/system/juju-dashboard.service <<'EOF'
[Unit]
Description=Juju Dashboard Dev Server

[Service]
ExecStart=bash -c "cd /home/ubuntu/juju-dashboard && source /home/ubuntu/.nvm/nvm.sh && yarn start"

[Install]
WantedBy=multi-user.target
EOF

# Start the services
sudo systemctl daemon-reload
sudo systemctl enable juju-dashboard.service
sudo systemctl start juju-dashboard.service
sudo systemctl enable jimm.service
sudo systemctl start jimm.service
