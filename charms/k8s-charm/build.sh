#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"

BUILD_TYPE="${1:-checkout}"
DASHBOARD_RESOURCE="${2:-}"

DASHBOARD_IMAGE_ID=""

# 1. Build or reuse the Juju Dashboard Docker image
if [ "$BUILD_TYPE" == "checkout" ]; then
    # Navigate to the root and build the image in a subshell
    (
        cd "$ROOT_DIR"
        DOCKER_BUILDKIT=1 docker build -t juju-dashboard:local .
    )

    # Attempt to import image into microk8s if available
    if command -v microk8s &> /dev/null; then
        docker image save juju-dashboard:local | sudo microk8s ctr image import -
    fi
    DASHBOARD_IMAGE_ID="juju-dashboard:local"

elif [ "$BUILD_TYPE" == "dashboard-resource" ]; then
    # The ID comes directly from the input resource
    DASHBOARD_IMAGE_ID="canonicalwebteam/juju-dashboard:${DASHBOARD_RESOURCE}"
else
    echo "Error: Invalid BUILD_TYPE specified: '$BUILD_TYPE'."
    echo "Accepted types are 'checkout' (default) or 'dashboard-resource'."
    exit 1
fi

# Output the Dashboard Image ID for GitHub Actions
echo "id=$DASHBOARD_IMAGE_ID"

# 2. Install charmcraft
sudo snap install charmcraft --classic

# 3. Pack the charm
charmcraft pack