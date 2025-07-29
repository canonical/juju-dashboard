#!/bin/bash

# This script is to generate a token for CharmHub for use in CI. By default, the token will expire
# after 30 days.
# See: https://canonical-charmcraft.readthedocs-hosted.com/stable/howto/manage-the-current-charmhub-user/#log-in-to-charmhub

echo 'Generating charmhub token to `charmhub-token.auth`'

charmcraft login \
    --export charmhub-token.auth \
    --charm=juju-dashboard \
    --charm=juju-dashboard-k8s \
    --permission=package-manage \
    --permission=package-view

echo 'Upload token to https://github.com/canonical/juju-dashboard/settings/secrets/actions/CHARMHUB_TOKEN'
