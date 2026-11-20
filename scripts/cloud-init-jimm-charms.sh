# Set up node.
cd /home/ubuntu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source /home/ubuntu/.nvm/nvm.sh
nvm install 22
# Install Yarn without requiring user input.
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
npm install -g corepack

# Configure k8s.
sudo microk8s.enable hostpath-storage
sudo microk8s.enable dns
sudo microk8s.enable host-access
sudo microk8s.enable ingress
sudo microk8s disable metallb
subnet="$(ip route get 1 | head -n 1 | awk '{print $7}' | awk -F. '{print $1 "." $2 "." $3 ".240/24"}')"
sudo microk8s enable metallb:"$subnet"
microk8s status --wait-ready

# Set up IAM
cd ~
git clone https://github.com/canonical/iam-bundle-integration.git && cd iam-bundle-integration
terraform -chdir=examples/tutorial init
terraform -chdir=examples/tutorial apply -auto-approve
juju switch iam
# Wait a long time for the first app in the model.
TYPE=application NAME=hyrda TIMEOUT_MINUTES=10 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
TYPE=application NAME=kratos TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju switch core
# Postgres needs a longer timeout.
TYPE=application NAME=postgresql-k8s TIMEOUT_MINUTES=10 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
TYPE=application NAME=self-signed-certificates TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju switch iam
# disable MFA to avoid unnecessary steps
juju config kratos enforce_mfa=False
# create the user and get the identity-id
TYPE=unit NAME=kratos/0 TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
action_output=$(juju run kratos/0 create-admin-account email=admin@example.com password=password1 username=admin --format json)
identity_id=$(echo $action_output | yq '."kratos/0".results."identity-id"')
# create a password secret and get the secret-uri
password_secret=$(juju add-secret password-secret password=password1)
# grant kratos access to the created secret
juju grant-secret password-secret kratos
juju run kratos/0 reset-password identity-id="$identity_id" password-secret-id="$password_secret"
juju switch core
TRAEFIK_PUBLIC=$(juju status traefik-public --format yaml | yq .applications.traefik-public.units.traefik-public/0.address)
juju config traefik-public external_hostname="iam.$TRAEFIK_PUBLIC.nip.io"
TYPE=application NAME=traefik-public TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for

# Set up JIMM
juju add-model jimm
juju deploy juju-jimm-k8s --channel=3/edge jimm --config postgres-secret-storage=true
juju deploy openfga-k8s --channel=2.0/stable openfga
juju deploy postgresql-k8s --channel=14/stable postgresql
juju deploy traefik-k8s --channel=latest/stable --trust ingress
juju relate jimm:ingress ingress
juju relate jimm:openfga openfga
juju relate jimm:database postgresql
juju relate openfga:database postgresql
juju trust postgresql --scope=cluster
TYPE=unit NAME=postgresql/0 TIMEOUT_MINUTES=10 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju relate jimm:ingress ingress
juju relate jimm:openfga openfga
juju relate jimm:database postgresql
TYPE=unit NAME=postgresql/0 TIMEOUT_MINUTES=10 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju relate openfga:database postgresql
TYPE=application NAME=openfga TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju relate jimm admin/iam.oauth-offer
juju relate jimm admin/core.send-ca-cert
juju deploy self-signed-certificates jimm-cert --channel 1/stable
juju relate ingress:certificates jimm-cert:certificates
# Give the user admin permissions so that they can add the workload controller.
juju config jimm controller-admins="admin@example.com"
juju config jimm uuid=3f4d142b-732e-4e99-80e7-5899b7e67e59
KEYS=$(go run github.com/go-macaroon-bakery/macaroon-bakery/cmd/bakery-keygen/v3@latest)
juju config jimm public-key=$(echo $KEYS | yq .public)
juju config jimm private-key=$(echo $KEYS | yq .private)
TYPE=unit NAME=ingress/0 TIMEOUT_MINUTES=5 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
ingress_address=$(kubectl get service ingress-lb -n jimm -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "$ingress_address test-jimm.local" | sudo tee -a /etc/hosts
juju config jimm dns-name=test-jimm.local
juju config ingress external_hostname=test-jimm.local
juju run jimm-cert/0 get-ca-certificate --quiet | yq .ca-certificate | sudo tee /usr/local/share/ca-certificates/jimm-test.crt
sudo update-ca-certificates --fresh
TYPE=application NAME=jimm TIMEOUT_MINUTES=1 EXPECTED_STATUS=active ~/juju-dashboard/scripts/wait-for
juju bootstrap microk8s workload-microk8s --config login-token-refresh-url=http://jimm-endpoints.jimm.svc.cluster.local:8080/.well-known/jwks.json
export USERNAME="admin@example.com"
export PASSWORD="password1"
npx tsx .github/actions/setup-jimm/cli-login.ts
juju jaas register-controller workload-microk8s --local --tls-hostname juju-apiserver
juju update-credentials microk8s --controller jimm-k8s

exit 0