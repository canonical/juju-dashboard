# Copyright 2026 Canonical
# See LICENSE file for licensing details.

import unittest

from ops.model import ActiveStatus, BlockedStatus, MaintenanceStatus
from ops.testing import Harness

from common.charm import DashboardCharm

FAKE_ENDPOINT = {
    "bind-addresses": [
        {
            "macaddress": "",
            "interface-name": "foo",
            "addresses": [{"address": "10.10.10.10", "cidr": "10.10.10.0/24"}],
        }
    ],
    "ingress-addresses": ["10.10.10.11"],
}

meta = """
name: juju-dashboard
provides:
  dashboard:
    interface: http
requires:
  controller:
    interface: juju-dashboard
"""


class TestSharedCharm(unittest.TestCase):
    def setUp(self):
        self.harness = Harness(DashboardCharm, meta=meta)
        self.addCleanup(self.harness.cleanup)
        self.harness.begin_with_initial_hooks()
        self.harness.framework.model._backend.network_get = (
            lambda endpoint_name, relation_id: FAKE_ENDPOINT
        )
        self.rel_id = self.harness.add_relation("controller", "juju-controller")
        self.harness.add_relation_unit(self.rel_id, "juju-controller/0")

    def test_install_status(self):
        harness = Harness(DashboardCharm, meta=meta)
        self.addCleanup(harness.cleanup)
        harness.begin()
        harness.charm.on.install.emit()
        self.assertEqual(
            harness.model.unit.status,
            MaintenanceStatus("Awaiting controller relation."),
        )

    def test_missing_controller_url(self):
        # We should fail with a blocked status if the relation data is incomplete.
        self.harness.update_relation_data(
            self.rel_id,
            "juju-controller",
            {
                "controller-url": "",
                "identity-provider-url": "api/some/provider/url",
                "is-juju": "True",
            },
        )

        self.assertEqual(
            self.harness.model.unit.status, BlockedStatus("Missing controller URL")
        )

    def test_relation_departed(self):
        self.harness.model.unit.status = ActiveStatus()
        self.harness.remove_relation(self.rel_id)
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )

    def test_config_changed_no_relation(self):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.update_config()
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )

    def test_update_status_no_relation(self):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.charm.on.update_status.emit()
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )

    def test_upgrade_charm_no_relation(self):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.charm.on.upgrade_charm.emit()
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )
