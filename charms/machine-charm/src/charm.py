#!/usr/bin/env python3
# Copyright 2021 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging
import os

from charmhelpers.core import hookenv  # FIXME: This needs to be ported to ops.
from charms.juju_dashboard.v0.juju_dashboard import JujuDashData, JujuDashReq
from charms.nginx_ingress_integrator.v0.nginx_route import require_nginx_route
from jinja2 import Environment, FileSystemLoader
from ops.charm import CharmBase
from ops.framework import StoredState
from ops.main import main
from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus

logger = logging.getLogger(__name__)


class JujuDashboardCharm(CharmBase):
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
        self.framework.observe(self.on.install, self._on_install)
        self.framework.observe(self.on["controller"].relation_changed,
                               self._on_controller_relation_changed)
        self.framework.observe(self.on["controller"].relation_departed,
                               self._on_relation_departed)
        self.framework.observe(self.on["dashboard"].relation_changed,
                               self._on_dashboard_relation_changed)
        self.framework.observe(self.on["dashboard"].relation_departed,
                               self._on_relation_departed)
        self.framework.observe(self.on.config_changed, self._on_config_changed)
        self.framework.observe(self.on.update_status, self._on_config_changed)
        self.framework.observe(self.on.upgrade_charm, self._on_config_changed)

        self._stored.set_default(controllerData={})

        require_nginx_route(
            charm=self,
            service_hostname=self.app.name,
            service_name=self.app.name,
            service_port=8080,
        )

    def _on_install(self, _):
        os.system("apt install -y nginx")  # FIXME: use linux system tools
        hookenv.open_port(8080)
        self.unit.status = MaintenanceStatus("Awaiting controller relation.")

    def _on_dashboard_relation_changed(self, event):
        event.relation.data[self.app]["port"] = "8080"

    def _on_relation_departed(self, _):
        self.unit.status = BlockedStatus("Missing controller integration")

    def _on_controller_relation_changed(self, event):
        """A controller relation has been setup; configure our node service to talk to it."""
        requires = JujuDashReq(self, event.relation, event.app)
        if not requires.data["controller_url"]:
            self.unit.status = BlockedStatus("Missing controller URL")
            return

        self._configure(**requires.data)

    def _on_config_changed(self, _):
        relation = self.model.get_relation("controller")
        if not relation:
            self.unit.status = BlockedStatus("Missing controller integration")
            return

        data = JujuDashData(relation.data[relation.app])
        self._configure(**data)

    def _bool(self, boolean_variable):
        if type(boolean_variable) is str:
            return boolean_variable.lower() == "true"
        return boolean_variable

    def _configure(self, controller_url, identity_provider_url, is_juju):
        """Configure and restart our nginx and juju-dashboard services."""

        # Load up nginx templates and poke at system.
        env = Environment(loader=FileSystemLoader(os.getcwd()))
        env.filters['bool'] = self._bool

        config_template = env.get_template("src/config.js.template")
        config_template.stream(
            base_app_url="/",
            controller_api_endpoint=("" if self._bool(is_juju) else controller_url) + "/api",
            identity_provider_url=identity_provider_url,
            is_juju=is_juju,
            analytics_enabled=self.config.get('analytics-enabled')
        ).dump("src/dist/config.js")

        # nginx proxy_pass expects the protocol to be https
        controller_url = controller_url.replace("wss://", "https://")
        if not controller_url.startswith('https://'):
            controller_url = 'https://{}'.format(controller_url)

        if self.config.get('dns-name'):
            hookenv.open_port(443)
            hookenv.close_port(8080)

        nginx_template = env.get_template("src/nginx.conf.template")
        nginx_template = nginx_template.stream(
            controller_ws_api=controller_url,
            dashboard_root=os.getcwd(),
            dns_name=self.config.get('dns-name'),
            is_juju=self._bool(is_juju)
        ).dump("/etc/nginx/sites-available/default")

        nginx_status = os.system("sudo systemctl restart nginx")
        # If restarting nginx returns a 0 status it should have been successful
        if nginx_status == 0:
            self.unit.status = ActiveStatus()
        else:
            self.unit.status = BlockedStatus("Could not start nginx")


if __name__ == "__main__":
    main(JujuDashboardCharm)
