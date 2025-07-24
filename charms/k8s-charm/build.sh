#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"

BUILD_TYPE="${1:-source}"
DASHBOARD_RESOURCE="${2:-}"

DASHBOARD_IMAGE_ID=""

# 1. Build or reuse the Juju Dashboard Docker image
if [ "$BUILD_TYPE" == "source" ]; then
    # Navigate to the root and build the image in a subshell
    (
        cd "$ROOT_DIR"
        DOCKER_BUILDKIT=1 docker build -t juju-dashboard:local .
    )

    DASHBOARD_IMAGE_ID="juju-dashboard:local"

elif [ "$BUILD_TYPE" == "dashboard-resource" ]; then
    # The ID comes directly from the input resource
    DASHBOARD_IMAGE_ID="canonicalwebteam/juju-dashboard:${DASHBOARD_RESOURCE}"
else
    echo "Error: Invalid BUILD_TYPE specified: '$BUILD_TYPE'."
    echo "Accepted types are 'source' (default) or 'dashboard-resource'."
    exit 1
fi

# Output the Dashboard Image ID for GitHub Actions
echo "id=$DASHBOARD_IMAGE_ID"

# 2. Install charmcraft
sudo snap install charmcraft --classic

# 3. Wait for snap changes
while [ -n "$(snap changes charmcraft 2>/dev/null | awk '/^[0-9]+/ {if ($2 != "Done") print $2 }')" ]; do
  echo "Waiting for 'charmcraft' snap changes on host to finish..."
  sleep 1
done
sleep 1

# 4. Pack the charm
(
    cd "$SCRIPT_PATH"
    charmcraft pack
)