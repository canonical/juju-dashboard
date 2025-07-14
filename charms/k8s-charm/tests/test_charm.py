# Copyright 2022 Canonical Ltd.
# See LICENSE file for licensing details.
#
# Learn more about testing at: https://juju.is/docs/sdk/testing

import unittest

from ops.model import ActiveStatus, BlockedStatus
from ops.testing import Harness

from charm import JujuDashboardKubernetesCharm


class TestCharm(unittest.TestCase):
    def setUp(self):
        self.harness = Harness(JujuDashboardKubernetesCharm)
        self.addCleanup(self.harness.cleanup)
        self.harness.begin_with_initial_hooks()
        self.harness.set_can_connect('dashboard', True)
        self.container = self.harness.model.unit.get_container('dashboard')
        self.container.make_dir('/srv')
        self.container.make_dir('/etc/nginx/sites-available/', make_parents=True)
        self.rel_id = self.harness.add_relation("controller", "controller")
        self.harness.add_relation_unit(self.rel_id, "controller/0")
        self.harness.update_relation_data(self.rel_id, "controller", {
            "controller-url": "wss://10.10.10.1:107070",
            "is-juju": "True",
            "identity-provider-url": ""
        })

    def test_on_controller_relation_changed(self):
        self.harness.update_relation_data(self.rel_id, "controller", {
            "is-juju": "True",
        })
        with self.container.pull('/etc/nginx/sites-available/default') as f:
            nginx_config = f.read()
        self.assertTrue("https://10.10.10.1:107070" in nginx_config)
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("isJuju: true" in config)

    def test_relation_departed(self):
        self.harness.model.unit.status = ActiveStatus()
        self.harness.remove_relation(self.rel_id)
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration")
        )

    def test_config_changed(self):
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: true" in config)
        self.harness.update_config({"analytics-enabled": False})
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: false" in config)

    def test_config_changed_no_relation(self):
        self.harness.remove_relation(self.rel_id)
        self.harness.model.unit.status = ActiveStatus()
        self.harness.update_config({"analytics-enabled": False})
        self.assertEqual(
            self.harness.model.unit.status,
            BlockedStatus("Missing controller integration")
        )

    def test_update_status(self):
        self.harness.disable_hooks()
        self.harness.update_config({"analytics-enabled": False})
        self.harness.enable_hooks()
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: true" in config)
        self.harness.charm.on.update_status.emit()
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: false" in config)

    def test_upgrade_charm(self):
        self.harness.disable_hooks()
        self.harness.update_config({"analytics-enabled": False})
        self.harness.enable_hooks()
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: true" in config)
        self.harness.charm.on.upgrade_charm.emit()
        with self.container.pull('/srv/config.js') as f:
            config = f.read()
        self.assertTrue("analyticsEnabled: false" in config)
