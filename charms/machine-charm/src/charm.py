#!/usr/bin/env python3
# Copyright 2026 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging
import os
from pathlib import Path

from charms.haproxy.v1.haproxy_route import HaproxyRouteRequirer
from charms.nginx_ingress_integrator.v0.nginx_route import require_nginx_route
from ops.framework import StoredState
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus

from common.charm import DashboardCharm
from common.config import Config, to_bool

logger = logging.getLogger(__name__)


class JujuDashboardCharm(DashboardCharm):
    """Juju Dashboard Charm

    This is the "machine" version of the Juju Dashboard charm. The charm deploys a nodejs
    service (jass-dashboard), which provides the dashboard gui for a Juju
    controller. Relating to a controller gives the dashboard the information it needs to
    talk to a specific local controller.

    This charm requires a `controller` endpoint, and provides a `dashboard` endpoint.
    - The controller relation allows the dashboard to connect to a Juju controller.
    - The dashboard relation allows an http proxy to connect to the dashboard charm.

    """

    _stored = StoredState()

    def __init__(self, *args):
        super().__init__(*args)
        self._stored.set_default(controllerData={})

        require_nginx_route(
            charm=self,
            service_hostname=self.app.name,
            service_name=self.app.name,
            service_port=self.config.get("port"),
        )
        self._haproxy_route_requirer = HaproxyRouteRequirer(
            self,
            "haproxy-route",
            ports=[self.config.get("port")],
            service=self.app.name,
        )

    def _on_install(self, *args, **kwargs):
        super()._on_install(*args, **kwargs)
        os.system("apt install -y nginx")  # FIXME: use linux system tools
        self.unit.set_ports(self.config.get("port"))

    def _on_config_changed(self, *args, **kwargs):
        updated = super()._on_config_changed(*args, **kwargs)
        if updated:
            self._haproxy_route_requirer.provide_haproxy_route_requirements(
                self.app.name, ports=[self.config.get("port")]
            )

    def _update(self, event, controller_url, identity_provider_url, is_juju):
        """Configure and restart our nginx and juju-dashboard services."""

        current_path = Path(__file__).parent.resolve()
        config = Config(
            base_app_url="/",
            controller_url=controller_url,
            identity_provider_url=identity_provider_url,
            is_juju=to_bool(is_juju),
            analytics_enabled=to_bool(self.config.get("analytics-enabled")),
            dashboard_root=str(current_path / "dist"),
            port=self.config.get("port"),
        )
        config.write(write_index=False)
        self.unit.set_ports(self.config.get("port"))
        nginx_status = os.system("sudo systemctl restart nginx")
        # If restarting nginx returns a 0 status it should have been successful
        if nginx_status == 0:
            self.unit.status = ActiveStatus()
        else:
            self.unit.status = BlockedStatus("Could not start nginx")


if __name__ == "__main__":
    main(JujuDashboardCharm)
