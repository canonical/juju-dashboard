#! /bin/bash

set -euo pipefail # Exit on error, unset variables, or pipeline failure
SCRIPT_PATH=$(dirname "$(realpath "$0")")

ROOT_DIR="$SCRIPT_PATH/../../"

# 1. Build the Juju Dashboard Docker image from source
# Navigate to the root and build the image in a subshell
(
    cd "$ROOT_DIR"
    DOCKER_BUILDKIT=1 docker build -t juju-dashboard .
)

# 2. Install charmcraft
sudo snap install charmcraft --classic

# 3. Pack the charm
charmcraft pack