#!/usr/bin/env python3
# Copyright 2022 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging
from pathlib import Path
from urllib.parse import urlsplit

from charms.juju_dashboard.v0.juju_dashboard import JujuDashData, JujuDashReq
from charms.nginx_ingress_integrator.v0.nginx_route import require_nginx_route
from charms.traefik_k8s.v2.ingress import (
    IngressPerAppReadyEvent,
    IngressPerAppRequirer,
    IngressPerAppRevokedEvent,
)
from ops.charm import CharmBase, RelationEvent
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus

from config import Config, to_bool

logger = logging.getLogger(__name__)


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
            service_port=self.config.get("port"),
        )
        self.ingress = IngressPerAppRequirer(self, port=self.config.get("port"))
        self.framework.observe(self.ingress.on.ready, self._on_ingress_ready)
        self.framework.observe(self.ingress.on.revoked, self._on_ingress_revoked)

    def _on_install(self, _):
        self.unit.status = MaintenanceStatus("Awaiting controller relation.")

    def _on_dashboard_relation_changed(self, event):
        """When something relates to the dashboard, tell it the port the service is avilable on."""
        event.relation.data[self.app]["port"] = self.config.get("port")
        event.relation.data[self.unit]["port"] = self.config.get("port")

    def _on_relation_departed(self, event: RelationEvent):
        self.unit.status = BlockedStatus("Missing controller integration")

    def _on_controller_relation_changed(self, event: RelationEvent):
        """A controller relation has been setup; configure our workload."""
        requires = JujuDashReq(self, event.relation, event.app)
        if not requires.data["controller_url"]:
            self.unit.status = BlockedStatus("Missing controller URL")
            return

        self._update(event, **requires.data)

    def _update_using_relation(self, event):
        relation = self.model.get_relation("controller")
        if not relation:
            self.unit.status = BlockedStatus("Missing controller integration")
            return

        data = JujuDashData(relation.data[relation.app])
        self._update(event, **data)

    def _on_config_changed(self, event):
        self.ingress.provide_ingress_requirements(port=self.config.get("port"))
        self._update_using_relation(event)

    def _on_ingress_ready(self, event: IngressPerAppReadyEvent):
        self._update_using_relation(event)

    def _on_ingress_revoked(self, event: IngressPerAppRevokedEvent):
        self._update_using_relation(event)

    def _update(self, event, controller_url, identity_provider_url, is_juju):
        base_app_url: str | None = None
        if self.ingress is not None and self.ingress.url is not None:
            base_app_url = urlsplit(self.ingress.url).path
        config_dir = Path(__file__).parent.resolve()
        container = self.unit.get_container("dashboard")
        template = container.pull("/srv/index.charm.html").read()
        local_template = config_dir / "index.charm.html"
        local_template.write_text(template)
        config = Config(
            base_app_url="" if base_app_url is None else base_app_url,
            config_dir=str(config_dir),
            controller_url=controller_url,
            identity_provider_url=identity_provider_url,
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
