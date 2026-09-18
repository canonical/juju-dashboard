#!/usr/bin/env python3
# Copyright 2026 Canonical
# See LICENSE file for licensing details.
#
# Learn more at: https://juju.is/docs/sdk

import logging

from charms.juju_dashboard.v0.juju_dashboard import JujuDashData, JujuDashReq
from ops.charm import CharmBase, RelationEvent
from ops.model import BlockedStatus, MaintenanceStatus

logger = logging.getLogger(__name__)


class DashboardCharm(CharmBase):
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

    def _on_install(self, _):
        self.unit.status = MaintenanceStatus("Awaiting controller relation.")

    def _on_dashboard_relation_changed(self, event):
        event.relation.data[self.app]["port"] = self.config.get("port")
        event.relation.data[self.unit]["port"] = self.config.get("port")

    def _on_relation_departed(self, event: RelationEvent):
        self.unit.status = BlockedStatus("Missing controller integration")

    def _on_controller_relation_changed(self, event: RelationEvent):
        requires = JujuDashReq(self, event.relation, event.app)
        if not requires.data["controller_url"]:
            self.unit.status = BlockedStatus("Missing controller URL")
            return

        self._update(event, **requires.data)

    def _on_config_changed(self, event) -> bool:
        relation = self.model.get_relation("controller")
        if not relation:
            self.unit.status = BlockedStatus("Missing controller integration")
            return False

        data = JujuDashData(relation.data[relation.app])
        self._update(event, **data)
        return True

    def _update(self, event, controller_url, identity_provider_url, is_juju):
        pass
