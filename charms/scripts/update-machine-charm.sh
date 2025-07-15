#! /bin/bash
SCRIPT_PATH=$(dirname "$(realpath "$0")")

DASHBOARD_VERSION=${1:-latest}
dist_path="$SCRIPT_PATH/../machine-charm/src/dist"

# delete existing version
rm -rf $dist_path/*

echo "Downloading the $DASHBOARD_VERSION release..."
rm -f *.tar.bz2

wget -qO- https://api.github.com/repos/canonical/juju-dashboard/releases/$( if [[ $DASHBOARD_VERSION != "latest" ]]; then echo "tags/"; fi)$DASHBOARD_VERSION \
| grep tar.bz2 \
| cut -d : -f 2,3 \
| tr -d \" \
| wget -qi -

echo "Extracting the dashboard..."
tar -xf *.tar.bz2 -C $dist_path

# clean up
rm -f *.tar.bz2
rm -f $dist_path/config.js.go $dist_path/config.local.js

echo "Done!"
