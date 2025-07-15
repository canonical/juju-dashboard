"""This library defines the requires side of a relation to a Juju controller.

The relation is straightforward: we expect the other side of the relation to provide us
with a url to connect to, as well as optional additional configuration information.

"""
import re
from subprocess import check_output
from typing import Mapping

from ops.charm import CharmBase
from ops.model import Application, Relation

# The unique Charmhub library identifier, never change it
LIBID = "2d0d08ebc336404ba91a9a4daf5c40ee"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 1


class JujuDashReq:
    """Implementation of the "requires" (client) side of the relation.

    Counterintuitively, this is the Dashboard. The Juju Controller is "providing" us with
    the information the Dashboard needs to connect.
    """
    def __init__(self, charm: CharmBase, relation: Relation, provider: Application):
        """Populate our relation data.

        Also tries to send the endpoint data that the dashboard is being hosted at. This
        information can be relayed to the user via the controller when the user runs the
        `juju dashboard` command.

        Args:
            charm: the charm that is using this library.

            relation: the relation with the Juju controller. Usually even.relation in a
                relation handler.

            provider: The Application providing the controller data. Usually a
                juju-controller application.
        """
        self.data = JujuDashData(relation.data[provider])

        # Update the relation with our own ingress ip
        if charm.unit.is_leader():
            # TODO: handle the situation where there are multiple dashes, and the endpoint
            # is the haproxy address.
            ip = check_output(["unit-get", "public-address"]).decode().strip()
            relation.data[charm.model.app]['dashboard-ingress'] = ip


class JujuDashData(Mapping):

    def __init__(self, data):
        """Parse the config data from the controller into a Mapping.

        Note: The controller charm provides the full controller path but we use this path
        to generate the controller and model paths so we need to remove the supplied
        "/api" suffix.

        Args:
            relation: the relation with the Juju controller. Usually even.relation in a
                relation handler.

            provider: The Application providing the controller data. Usually a
                juju-controller application.

        """
        self._data = {
            "controller_url": re.sub(r'\/api$', '', data.get("controller-url", "")),
            "identity_provider_url": data.get("identity-provider-url", ""),
            "is_juju": data.get("is-juju", True),
        }

    def __contains__(self, key):
        return key in self._data

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)

    def __getitem__(self, key):
        return self._data[key]

    def __repr__(self):
        return repr(self._data)
