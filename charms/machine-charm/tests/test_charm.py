# Copyright 2021 Canonical
# See LICENSE file for licensing details.

import unittest
from unittest import mock

from ops.model import ActiveStatus, BlockedStatus
from ops.testing import Harness

import charm

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


class TestDashboardRelation(unittest.TestCase):

    @mock.patch("charm.os.system")
    def setUp(self, mock_system):
        self.haproxy_patcher = mock.patch("charm.HaproxyRouteRequirer")
        self.mock_haproxy_requirer = self.haproxy_patcher.start()
        self.harness = Harness(charm.JujuDashboardCharm)
        self.addCleanup(self.harness.cleanup)
        self.harness.begin_with_initial_hooks()

        self.harness.framework.model._backend.network_get = (
            lambda endpoint_name, relation_id: FAKE_ENDPOINT
        )

        self.rel_id = self.harness.add_relation(
            "controller", "juju-controller")
        self.harness.add_relation_unit(self.rel_id, "juju-controller/0")

    def tearDown(self):
        self.haproxy_patcher.stop()

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_relation(self, mock_system, mock_write):
        mock_system.return_value = 0

        self.harness.update_relation_data(
            self.rel_id,
            "juju-controller",
            {
                "controller-url": "api/some/controller/url",  # TODO: get real data
                "identity-provider-url": "api/some/provider/url",
                "is-juju": "True",
            },
        )

        self.assertEqual(self.harness.model.unit.status, ActiveStatus())
        # Verify that we tried to write templates.
        self.assertTrue(mock_write.called)

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
            self.harness.model.unit.status, BlockedStatus(
                "Missing controller URL")
        )

    def test_relation_departed(self):
        self.harness.model.unit.status = ActiveStatus()
        self.harness.remove_relation(self.rel_id)
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_config_changed(self, mock_system, mock_write):
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 8080)
        self.assertFalse(
            self.mock_haproxy_requirer.return_value
                .provide_haproxy_route_requirements.called
        )
        self.harness.update_config({"port": 123})
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 123)
        haproxy_instance = self.mock_haproxy_requirer.return_value
        haproxy_instance.provide_haproxy_route_requirements.assert_called_once_with(
            "juju-dashboard", ports=[123]
        )

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_config_changed_no_relation(self, mock_system, mock_wri):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.update_config({"is-juju": True})
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration"),
        )

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_update_status(self, mock_system, mock_write):
        self.harness.disable_hooks()
        self.harness.update_config({"port": 123})
        self.harness.enable_hooks()
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 8080)
        self.harness.charm.on.update_status.emit()
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 123)

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_upgrade_charm(self, mock_system, mock_write):
        self.harness.disable_hooks()
        self.harness.update_config({"port": 123})
        self.harness.enable_hooks()
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 8080)
        self.harness.charm.on.upgrade_charm.emit()
        ports = self.harness.model.unit.opened_ports()
        self.assertEqual(len(ports), 1)
        self.assertEqual(list(ports)[0].port, 123)

    @mock.patch("pathlib.Path.write_text")
    @mock.patch("charm.os.system")
    def test_could_not_start_nginx(self, mock_system, mock_write):
        mock_system.return_value = -1

        self.harness.update_relation_data(
            self.rel_id,
            "juju-controller",
            {
                "controller-url": "api/some/controller/url",  # TODO: get real data
                "identity-provider-url": "api/some/provider/url",
                "is-juju": "True",
            },
        )

        self.assertEqual(
            self.harness.model.unit.status, BlockedStatus(
                "Could not start nginx")
        )
