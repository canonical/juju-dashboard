# Copyright 2021 Canonical
# See LICENSE file for licensing details.

import unittest
from unittest import mock

from ops.model import ActiveStatus, BlockedStatus
from ops.testing import Harness

import charm

FAKE_ENDPOINT = {
    "bind-addresses": [{
        "macaddress": "",
        "interface-name": "foo",
        "addresses": [{"address": "10.10.10.10", "cidr": "10.10.10.0/24"}],
    }],
    "ingress-addresses": ["10.10.10.11"],
}


class TestDashboardRelation(unittest.TestCase):

    @mock.patch('charm.hookenv')
    @mock.patch('charm.os.system')
    def setUp(self, mock_system, mock_hookenv):
        self.harness = Harness(charm.JujuDashboardCharm)
        self.addCleanup(self.harness.cleanup)
        self.harness.begin_with_initial_hooks()

        self.harness.framework.model._backend.network_get = \
            lambda endpoint_name, relation_id: FAKE_ENDPOINT

        self.rel_id = self.harness.add_relation('controller', 'juju-controller')
        self.harness.add_relation_unit(self.rel_id, "juju-controller/0")

    @mock.patch("charm.Environment")
    @mock.patch('charm.os.system')
    def test_relation(self, mock_system, mock_env):
        mock_system.return_value = 0

        self.harness.update_relation_data(self.rel_id, "juju-controller", {
            "controller-url": "api/some/controller/url",  # TODO: get real data
            "identity-provider-url": "api/some/provider/url",
            "is-juju": "True"
        })

        self.assertEqual(self.harness.model.unit.status, ActiveStatus())
        self.assertTrue(mock_env.called)  # Verify that we tried to write templates.

    def test_missing_controller_url(self):
        # We should fail with a blocked status if the relation data is incomplete.
        self.harness.update_relation_data(self.rel_id, "juju-controller", {
            "controller-url": "",
            "identity-provider-url": "api/some/provider/url",
            "is-juju": "True"
        })

        self.assertEqual(self.harness.model.unit.status, BlockedStatus("Missing controller URL"))

    def test_relation_departed(self):
        self.harness.model.unit.status = ActiveStatus()
        self.harness.remove_relation(self.rel_id)
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration")
        )

    @mock.patch("charm.Environment")
    @mock.patch('charm.hookenv')
    @mock.patch('charm.os.system')
    def test_config_changed(self, mock_system, mock_hookenv, mock_env):
        self.assertFalse(mock_hookenv.open_port.called)
        self.harness.update_config({"dns-name": "dashboard.test"})
        self.assertTrue(mock_hookenv.open_port.called)

    @mock.patch("charm.Environment")
    @mock.patch('charm.hookenv')
    @mock.patch('charm.os.system')
    def test_config_changed_no_relation(self, mock_system, mock_hookenv, mock_env):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.update_config({"is-juju": True})
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration")
        )

    @mock.patch("charm.Environment")
    @mock.patch('charm.hookenv')
    @mock.patch('charm.os.system')
    def test_update_status(self, mock_system, mock_hookenv, mock_env):
        self.harness.disable_hooks()
        self.harness.update_config({"dns-name": "dashboard.test"})
        self.harness.enable_hooks()
        self.assertFalse(mock_hookenv.open_port.called)
        self.harness.charm.on.update_status.emit()
        self.assertTrue(mock_hookenv.open_port.called)

    @mock.patch("charm.Environment")
    @mock.patch('charm.hookenv')
    @mock.patch('charm.os.system')
    def test_upgrade_charm(self, mock_system, mock_hookenv, mock_env):
        self.harness.disable_hooks()
        self.harness.update_config({"dns-name": "dashboard.test"})
        self.harness.enable_hooks()
        self.assertFalse(mock_hookenv.open_port.called)
        self.harness.charm.on.upgrade_charm.emit()
        self.assertTrue(mock_hookenv.open_port.called)

    @mock.patch("charm.Environment")
    @mock.patch('charm.os.system')
    def test_could_not_start_nginx(self, mock_system, mock_env):
        mock_system.return_value = -1

        self.harness.update_relation_data(self.rel_id, "juju-controller", {
            "controller-url": "api/some/controller/url",  # TODO: get real data
            "identity-provider-url": "api/some/provider/url",
            "is-juju": "True"
        })

        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Could not start nginx")
        )
