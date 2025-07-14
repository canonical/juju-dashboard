#!/usr/bin/env python3
# Copyright 2022 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging
import os

from charms.juju_dashboard.v0.juju_dashboard import JujuDashData, JujuDashReq
from charms.nginx_ingress_integrator.v0.nginx_route import require_nginx_route
from jinja2 import Environment, FileSystemLoader
from ops.charm import CharmBase, RelationEvent
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus

logger = logging.getLogger(__name__)

DASHBOARD_PORT = 8080


class JujuDashboardKubernetesCharm(CharmBase):
    """Juju Dashboard Kubernetes Charm

    This is the kubernetes version of the Juju Dashboard charm. The charm creates a nodejs
    service providing the dashboard gui for a Juju controller. Relating to a controller
    gives the dashboard the information it needs to talk to a specific local controller.

    This charm requires a `controller` endpoint, and provides a `dashboard` endpoint.
    - The controller relation allows the dashboard to connect to a Juju controller.
    - The dashboard relation allows an http proxy to connect to the dashboard charm.

    Note: This charm will not add the dashboard layers to the workload until a relation to
    the controller is established.

    """

    def __init__(self, *args):
        super().__init__(*args)

        self.framework.observe(self.on.install, self._on_install)

        self.framework.observe(
            self.on["controller"].relation_changed,
            self._on_controller_relation_changed,
        )
        self.framework.observe(
            self.on["controller"].relation_departed,
            self._on_relation_departed,
        )
        self.framework.observe(
            self.on["dashboard"].relation_changed,
            self._on_dashboard_relation_changed,
        )
        self.framework.observe(
            self.on["dashboard"].relation_departed,
            self._on_relation_departed,
        )
        self.framework.observe(self.on.config_changed, self._on_config_changed)
        self.framework.observe(self.on.update_status, self._on_config_changed)
        self.framework.observe(self.on.upgrade_charm, self._on_config_changed)

        require_nginx_route(
            charm=self,
            service_hostname=self.app.name,
            service_name=self.app.name,
            service_port=DASHBOARD_PORT,
        )

    def _on_install(self, _):
        self.unit.status = MaintenanceStatus("Awaiting controller relation.")

    def _on_dashboard_relation_changed(self, event):
        """When something relates to the dashboard, tell it that we speak on port 8080."""
        event.relation.data[self.app]["port"] = DASHBOARD_PORT

    def _on_relation_departed(self, event: RelationEvent):
        self.unit.status = BlockedStatus("Missing controller integration")

    def _on_controller_relation_changed(self, event: RelationEvent):
        """A controller relation has been setup; configure our workload."""
        requires = JujuDashReq(self, event.relation, event.app)
        if not requires.data["controller_url"]:
            self.unit.status = BlockedStatus("Missing controller URL")
            return

        self._update(event, **requires.data)

    def _on_config_changed(self, event):
        relation = self.model.get_relation("controller")
        if not relation:
            self.unit.status = BlockedStatus("Missing controller integration")
            return

        data = JujuDashData(relation.data[relation.app])
        self._update(event, **data)

    def _update(self, event, controller_url, identity_provider_url, is_juju):
        dashboard_config, nginx_config = self._render_config(
            controller_url, identity_provider_url, is_juju)
        container = self.unit.get_container("dashboard")
        if not container.can_connect():
            event.defer()
            self.unit.status = MaintenanceStatus("Waiting for container.")
            return

        self._configure(container, dashboard_config, nginx_config)

        self.unit.status = ActiveStatus()

    def _bool(self, boolean_variable):
        if type(boolean_variable) is str:
            return boolean_variable.lower() == "true"
        return boolean_variable

    def _render_config(self, controller_url, identity_provider_url, is_juju):
        """
        Given data from the controller relation, render config templates.

        Returns the dashboard and nginx template as strings.
        """

        env = Environment(loader=FileSystemLoader(os.getcwd()))
        env.filters["bool"] = self._bool

        config_template = env.get_template("src/config.js.j2")
        config = config_template.render(
            base_app_url="/",
            controller_api_endpoint=("" if self._bool(is_juju) else controller_url) + "/api",
            identity_provider_url=identity_provider_url,
            is_juju=is_juju,
            analytics_enabled=self.config.get('analytics-enabled'),
        )

        nginx_template = env.get_template("src/nginx.conf.j2")
        nginx_config = nginx_template.render(
            # nginx proxy_pass expects the protocol to be https
            controller_ws_api=controller_url.replace("wss://", "https://"),
            dashboard_root="/srv",
            port=DASHBOARD_PORT,
            is_juju=self._bool(is_juju),
        )

        return config, nginx_config

    def _configure(self, container, dashboard_config, nginx_config):
        """
        Add and configure our pebble layer.

        Adds a working nodejs server to our container.
        """

        pebble_layer = {
            "summary": "dashboard layer",
            "description": "pebble config layer for dashboard",
            "services": {
                "dashboard": {
                    "override": "replace",
                    "summary": "dashboard",
                    "command": "/srv/entrypoint",
                    "startup": "enabled",
                    "environment": {},
                }
            },
        }
        container.add_layer("dashboard", pebble_layer, combine=True)

        container.push("/srv/config.js", dashboard_config)
        container.push("/etc/nginx/sites-available/default", nginx_config)

        container.autostart()


if __name__ == "__main__":
    main(JujuDashboardKubernetesCharm)
