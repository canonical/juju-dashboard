#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"
BUILD_OUTPUT="build"
CHARM_DIST_PATH="$SCRIPT_PATH/src/dist"

# 1. Build the Juju Dashboard front-end from source
# Navigate to the root and build it in a subshell
(
    cd "$ROOT_DIR"
    yarn install
    yarn build
)

# 2. Copy the built dashboard assets to the charm's src/dist
mkdir -p "$CHARM_DIST_PATH"
rm -rf "$CHARM_DIST_PATH"/*
cp -r "$ROOT_DIR/$BUILD_OUTPUT"/* "$CHARM_DIST_PATH"/

# 3. Install charmcraft
sudo snap install charmcraft --classic

# 4. Pack the charm
charmcraft pack