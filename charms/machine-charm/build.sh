#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"
BUILD_OUTPUT="build"
CHARM_DIST_PATH="$SCRIPT_PATH/src/dist"

BUILD_TYPE="${1:-checkout}"
DASHBOARD_VERSION="${2:-}"

# 1. Build or reuse the Juju Dashboard assets
if [ "$BUILD_TYPE" == "checkout" ]; then
    # Navigate to the root and build it in a subshell
    (
        cd "$ROOT_DIR"
        yarn install
        yarn build
    )

elif [ "$BUILD_TYPE" == "dashboard-version" ]; then
    # The assets from another version will be used
    wget -qO- https://api.github.com/repos/canonical/juju-dashboard/releases/tags/$DASHBOARD_VERSION \
    | grep tar.bz2 \
    | cut -d : -f 2,3 \
    | tr -d \" \
    | wget -qi -
else
    echo "Error: Invalid BUILD_TYPE specified: '$BUILD_TYPE'."
    echo "Accepted types are 'checkout' (default) or 'dashboard-version'."
    exit 1
fi

# 2. Copy the built dashboard assets to the charm's src/dist
mkdir -p "$CHARM_DIST_PATH"
rm -rf "$CHARM_DIST_PATH"/*
cp -r "$ROOT_DIR/$BUILD_OUTPUT"/* "$CHARM_DIST_PATH"/

# 3. Install charmcraft
sudo snap install charmcraft --classic

# 4. Pack the charm
(
    cd "$SCRIPT_PATH"
    charmcraft pack
)