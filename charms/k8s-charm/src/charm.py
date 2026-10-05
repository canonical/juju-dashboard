#!/usr/bin/env python3
# Copyright 2026 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging
from urllib.parse import urlsplit

from charms.juju_dashboard.v0.juju_dashboard import JujuDashData
from charms.nginx_ingress_integrator.v0.nginx_route import require_nginx_route
from charms.traefik_k8s.v2.ingress import (
    IngressPerAppReadyEvent,
    IngressPerAppRequirer,
    IngressPerAppRevokedEvent,
)
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus

from common.charm import DashboardCharm
from common.config import Config, to_bool

logger = logging.getLogger(__name__)


class JujuDashboardKubernetesCharm(DashboardCharm):
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
        require_nginx_route(
            charm=self,
            service_hostname=self.app.name,
            service_name=self.app.name,
            service_port=self.config.get("port"),
        )
        self.ingress = IngressPerAppRequirer(self, port=self.config.get("port"))
        self.framework.observe(self.ingress.on.ready, self._on_ingress_ready)
        self.framework.observe(self.ingress.on.revoked, self._on_ingress_revoked)

    def _update_using_relation(self, event):
        relation = self.model.get_relation("controller")
        if not relation:
            self.unit.status = BlockedStatus("Missing controller integration")
            return

        data = JujuDashData(relation.data[relation.app])
        self._update(event, **data)

    def _on_config_changed(self, *args, **kwargs):
        updated = super()._on_config_changed(*args, **kwargs)
        if updated:
            self.ingress.provide_ingress_requirements(port=self.config.get("port"))

    def _on_ingress_ready(self, event: IngressPerAppReadyEvent):
        self._update_using_relation(event)

    def _on_ingress_revoked(self, event: IngressPerAppRevokedEvent):
        self._update_using_relation(event)

    def _update(self, event, controller_url, identity_provider_url, is_juju):
        base_app_url: str | None = None
        if self.ingress is not None and self.ingress.url is not None:
            base_app_url = urlsplit(self.ingress.url).path
        container = self.unit.get_container("dashboard")
        with container.pull("/srv/index.charm.html") as pulled_template:
            template = pulled_template.read()
        config = Config(
            base_app_url="" if base_app_url is None else base_app_url,
            controller_url=controller_url,
            identity_provider_url=identity_provider_url,
            index_template=template,
            is_juju=to_bool(is_juju),
            analytics_enabled=to_bool(self.config.get("analytics-enabled")),
            dashboard_root="/srv",
            port=self.config.get("port"),
        )
        dashboard_config, nginx_config, index_html = config.generate()
        if not container.can_connect():
            event.defer()
            self.unit.status = MaintenanceStatus("Waiting for container.")
            return

        self._configure(container, dashboard_config, nginx_config, index_html)

        self.unit.status = ActiveStatus()

    def _configure(self, container, dashboard_config, nginx_config, index_html):
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
        container.push("/srv/index.html", index_html)
        container.push("/etc/nginx/sites-available/default", nginx_config)

        container.replan()
        container.restart("dashboard")


if __name__ == "__main__":
    main(JujuDashboardKubernetesCharm)
