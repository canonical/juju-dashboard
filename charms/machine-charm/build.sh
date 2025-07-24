#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"
BUILD_OUTPUT="build"
CHARM_DIST_PATH="$SCRIPT_PATH/src/dist"

BUILD_TYPE="${1:-source}"
DASHBOARD_VERSION="${2:-}"

# 1. Build or reuse the Juju Dashboard assets
mkdir -p "$CHARM_DIST_PATH"
rm -rf "$CHARM_DIST_PATH"/*

if [ "$BUILD_TYPE" == "source" ]; then
    # Navigate to the root and build it in a subshell
    (
        cd "$ROOT_DIR"
        yarn install
        yarn build
        cp -r "$ROOT_DIR/$BUILD_OUTPUT"/* "$CHARM_DIST_PATH"/
    )

elif [ "$BUILD_TYPE" == "dashboard-version" ]; then
    # The assets from another version will be used
    rm -f *.tar.bz2

    wget -qO- https://api.github.com/repos/canonical/juju-dashboard/releases/tags/$DASHBOARD_VERSION \
    | grep tar.bz2 \
    | cut -d : -f 2,3 \
    | tr -d \" \
    | wget -qi -

    echo "Extracting the dashboard..."
    tar -xf *.tar.bz2 -C $CHARM_DIST_PATH

    # Clean up downloaded tarball and temporary config files
    rm -f *.tar.bz2
    rm -f $CHARM_DIST_PATH/config.js.go $CHARM_DIST_PATH/config.local.js
else
    echo "Error: Invalid BUILD_TYPE specified: '$BUILD_TYPE'."
    echo "Accepted types are 'source' (default) or 'dashboard-version'."
    exit 1
fi

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