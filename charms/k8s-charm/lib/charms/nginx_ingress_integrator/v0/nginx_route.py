# Copyright 2024 Canonical Ltd.
# Licensed under the Apache2.0. See LICENSE file in charm source for details.
"""Library for the nginx-route relation.

This library contains the require and provide functions for handling
the nginx-route interface.

Import `require_nginx_route` in your charm, with four required keyword arguments:
- charm: (the charm itself)
- service_hostname
- service_name
- service_port

Other optional arguments include:
- additional_hostnames
- backend_protocol
- limit_rps
- limit_whitelist
- max_body_size
- owasp_modsecurity_crs
- owasp_modsecurity_custom_rules
- path_routes
- retry_errors
- rewrite_target
- rewrite_enabled
- service_namespace
- session_cookie_max_age
- tls_secret_name

See [the config section](https://charmhub.io/nginx-ingress-integrator/configure) for descriptions
of each, along with the required type.

As an example, add the following to `src/charm.py`:
```python
from charms.nginx_ingress_integrator.v0.nginx_route import NginxRouteRequirer

# In your charm's `__init__` method (assuming your app is listening on port 8080).
require_nginx_route(
    charm=self,
    service_hostname=self.app.name,
    service_name=self.app.name,
    service_port=8080
)

```
And then add the following to `metadata.yaml`:
```
requires:
  nginx-route:
    interface: nginx-route
```
You _must_ require nginx route as part of the `__init__` method
rather than, for instance, a config-changed event handler, for the relation
changed event to be properly handled.

In the example above we're setting `service_hostname` (which translates to the
external hostname for the application when related to nginx-ingress-integrator)
to `self.app.name` here. This ensures by default the charm will be available on
the name of the deployed juju application, but can be overridden in a
production deployment by setting `service-hostname` on the
nginx-ingress-integrator charm. For example:
```bash
juju deploy nginx-ingress-integrator
juju deploy my-charm
juju relate nginx-ingress-integrator my-charm:nginx-route
# The service is now reachable on the ingress IP(s) of your k8s cluster at
# 'http://my-charm'.
juju config nginx-ingress-integrator service-hostname='my-charm.example.com'
# The service is now reachable on the ingress IP(s) of your k8s cluster at
# 'http://my-charm.example.com'.
```
"""
import logging
import typing
import weakref

import ops.charm
import ops.framework
import ops.model

# The unique Charmhub library identifier, never change it
LIBID = "3c212b6ed3cf43dfbf9f2e322e634beb"

# Increment this major API version when introducing breaking changes
LIBAPI = 0

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 7

__all__ = ["require_nginx_route", "provide_nginx_route"]

logger = logging.getLogger(__name__)


class _NginxRouteAvailableEvent(ops.framework.EventBase):
    """NginxRouteAvailableEvent custom event.

    This event indicates the nginx-route provider is available.
    """


class _NginxRouteBrokenEvent(ops.charm.RelationBrokenEvent):
    """NginxRouteBrokenEvent custom event.

    This event indicates the nginx-route provider is broken.
    """


class _NginxRouteCharmEvents(ops.charm.CharmEvents):
    """Custom charm events.

    Attrs:
        nginx_route_available: Event to indicate that Nginx route relation is available.
        nginx_route_broken: Event to indicate that Nginx route relation is broken.
    """

    nginx_route_available = ops.framework.EventSource(_NginxRouteAvailableEvent)
    nginx_route_broken = ops.framework.EventSource(_NginxRouteBrokenEvent)


class NginxRouteRequirer(ops.framework.Object):
    """This class defines the functionality for the 'requires' side of the 'nginx-route' relation.

    Hook events observed:
        - relation-changed
    """

    def __init__(
        self,
        charm: ops.charm.CharmBase,
        config: typing.Dict[str, typing.Union[str, int, bool]],
        nginx_route_relation_name: str = "nginx-route",
    ):
        """Init function for the NginxRouteRequires class.

        Args:
            charm: The charm that requires the nginx-route relation.
            config: Contains all the configuration options for nginx-route.
            nginx_route_relation_name: Specifies the relation name of the relation handled by this
                requirer class. The relation must have the nginx-route interface.
        """
        super().__init__(charm, nginx_route_relation_name)
        self._charm = charm
        self._nginx_route_relation_name = nginx_route_relation_name
        self._charm.framework.observe(
            self._charm.on[self._nginx_route_relation_name].relation_changed,
            self._config_reconciliation,
        )
        # Set default values.
        self.config: typing.Dict[str, typing.Union[str, int, bool]] = {
            "service-namespace": self._charm.model.name,
            **config,
        }
        self._config_reconciliation(None)

    def _config_reconciliation(self, _event: typing.Any = None) -> None:
        """Update the nginx-route relation data to be exactly as defined by config."""
        if not self._charm.model.unit.is_leader():
            return
        for relation in self._charm.model.relations[self._nginx_route_relation_name]:
            relation_app_data = relation.data[self._charm.app]
            delete_keys = {
                relation_field
                for relation_field in relation_app_data
                if relation_field not in self.config
            }
            for delete_key in delete_keys:
                del relation_app_data[delete_key]
            relation_app_data.update({k: str(v) for k, v in self.config.items()})


# C901 is ignored since the method has too many ifs but wouldn't be
# necessarily good to reduce to smaller methods.
# E501: line too long
def require_nginx_route(  # pylint: disable=too-many-locals,too-many-branches,too-many-arguments # noqa: C901,E501
    *,
    charm: ops.charm.CharmBase,
    service_hostname: str,
    service_name: str,
    service_port: int,
    additional_hostnames: typing.Optional[str] = None,
    backend_protocol: typing.Optional[str] = None,
    enable_access_log: typing.Optional[bool] = None,
    limit_rps: typing.Optional[int] = None,
    limit_whitelist: typing.Optional[str] = None,
    max_body_size: typing.Optional[int] = None,
    owasp_modsecurity_crs: typing.Optional[str] = None,
    owasp_modsecurity_custom_rules: typing.Optional[str] = None,
    path_routes: typing.Optional[str] = None,
    retry_errors: typing.Optional[str] = None,
    rewrite_target: typing.Optional[str] = None,
    rewrite_enabled: typing.Optional[bool] = None,
    service_namespace: typing.Optional[str] = None,
    session_cookie_max_age: typing.Optional[int] = None,
    tls_secret_name: typing.Optional[str] = None,
    nginx_route_relation_name: str = "nginx-route",
) -> NginxRouteRequirer:
    """Set up nginx-route relation handlers on the requirer side.

    This function must be invoked in the charm class constructor.

    Args:
        charm: The charm that requires the nginx-route relation.
        service_hostname: configure Nginx ingress integrator
            service-hostname option via relation.
        service_name: configure Nginx ingress integrator service-name
            option via relation.
        service_port: configure Nginx ingress integrator service-port
            option via relation.
        additional_hostnames: configure Nginx ingress integrator
            additional-hostnames option via relation, optional.
        backend_protocol: configure Nginx ingress integrator
            backend-protocol option via relation, optional.
        enable_access_log: configure Nginx ingress
            nginx.ingress.kubernetes.io/enable-access-log option.
        limit_rps: configure Nginx ingress integrator limit-rps
            option via relation, optional.
        limit_whitelist: configure Nginx ingress integrator
            limit-whitelist option via relation, optional.
        max_body_size: configure Nginx ingress integrator
            max-body-size option via relation, optional.
        owasp_modsecurity_crs: configure Nginx ingress integrator
            owasp-modsecurity-crs  option via relation, optional.
        owasp_modsecurity_custom_rules: configure Nginx ingress
            integrator owasp-modsecurity-custom-rules option via
            relation, optional.
        path_routes: configure Nginx ingress integrator path-routes
            option via relation, optional.
        retry_errors: configure Nginx ingress integrator retry-errors
            option via relation, optional.
        rewrite_target: configure Nginx ingress integrator
            rewrite-target option via relation, optional.
        rewrite_enabled: configure Nginx ingress integrator
            rewrite-enabled option via relation, optional.
        service_namespace: configure Nginx ingress integrator
            service-namespace option via relation, optional.
        session_cookie_max_age: configure Nginx ingress integrator
            session-cookie-max-age option via relation, optional.
        tls_secret_name: configure Nginx ingress integrator
            tls-secret-name option via relation, optional.
        nginx_route_relation_name: Specifies the relation name of
            the relation handled by this requirer class. The relation
            must have the nginx-route interface.

    Returns:
        the NginxRouteRequirer.
    """
    config: typing.Dict[str, typing.Union[str, int, bool]] = {}
    if service_hostname is not None:
        config["service-hostname"] = service_hostname
    if service_name is not None:
        config["service-name"] = service_name
    if service_port is not None:
        config["service-port"] = service_port
    if additional_hostnames is not None:
        config["additional-hostnames"] = additional_hostnames
    if backend_protocol is not None:
        config["backend-protocol"] = backend_protocol
    if enable_access_log is not None:
        config["enable-access-log"] = "true" if enable_access_log else "false"
    if limit_rps is not None:
        config["limit-rps"] = limit_rps
    if limit_whitelist is not None:
        config["limit-whitelist"] = limit_whitelist
    if max_body_size is not None:
        config["max-body-size"] = max_body_size
    if owasp_modsecurity_crs is not None:
        config["owasp-modsecurity-crs"] = owasp_modsecurity_crs
    if owasp_modsecurity_custom_rules is not None:
        config["owasp-modsecurity-custom-rules"] = owasp_modsecurity_custom_rules
    if path_routes is not None:
        config["path-routes"] = path_routes
    if retry_errors is not None:
        config["retry-errors"] = retry_errors
    if rewrite_target is not None:
        config["rewrite-target"] = rewrite_target
    if rewrite_enabled is not None:
        config["rewrite-enabled"] = rewrite_enabled
    if service_namespace is not None:
        config["service-namespace"] = service_namespace
    if session_cookie_max_age is not None:
        config["session-cookie-max-age"] = session_cookie_max_age
    if tls_secret_name is not None:
        config["tls-secret-name"] = tls_secret_name

    return NginxRouteRequirer(
        charm=charm, config=config, nginx_route_relation_name=nginx_route_relation_name
    )


class _NginxRouteProvider(ops.framework.Object):
    """Class containing the functionality for the 'provides' side of the 'nginx-route' relation.

    Attrs:
        on: nginx-route relation event describer.

    Hook events observed:
        - relation-changed
    """

    on = _NginxRouteCharmEvents()

    def __init__(
        self,
        charm: ops.charm.CharmBase,
        nginx_route_relation_name: str = "nginx-route",
    ):
        """Init function for the NginxRouterProvides class.

        Args:
            charm: The charm that provides the nginx-route relation.
            nginx_route_relation_name: Specifies the relation name of the relation handled by this
                provider class. The relation must have the nginx-route interface.
        """
        # Observe the relation-changed hook event and bind
        # self.on_relation_changed() to handle the event.
        super().__init__(charm, nginx_route_relation_name)
        self._charm = charm
        self._charm.framework.observe(
            self._charm.on[nginx_route_relation_name].relation_changed, self._on_relation_changed
        )
        self._charm.framework.observe(
            self._charm.on[nginx_route_relation_name].relation_broken, self._on_relation_broken
        )

    def _on_relation_changed(self, event: ops.charm.RelationChangedEvent) -> None:
        """Handle a change to the nginx-route relation.

        Confirm we have the fields we expect to receive.

        Args:
            event: Event triggering the relation-changed hook for the relation.

        Raises:
            RuntimeError: if _on_relation changed is triggered by a broken relation.
        """
        # `self.unit` isn't available here, so use `self.model.unit`.
        if not self._charm.model.unit.is_leader():
            return

        relation_name = event.relation.name
        remote_app = event.app
        if remote_app is None:
            raise RuntimeError("_on_relation_changed was triggered by a broken relation.")

        if not event.relation.data[remote_app]:
            logger.info(
                "%s hasn't finished configuring, waiting until the relation data is populated.",
                relation_name,
            )
            return

        required_fields = {"service-hostname", "service-port", "service-name"}
        missing_fields = sorted(
            field
            for field in required_fields
            if event.relation.data[remote_app].get(field) is None
        )
        if missing_fields:
            logger.warning(
                "Missing required data fields for %s relation: %s",
                relation_name,
                ", ".join(missing_fields),
            )
            self._charm.model.unit.status = ops.model.BlockedStatus(
                f"Missing fields for {relation_name}: {', '.join(missing_fields)}"
            )
            return

        # Create an event that our charm can use to decide it's okay to
        # configure the Kubernetes Nginx ingress resources.
        self.on.nginx_route_available.emit()

    def _on_relation_broken(self, event: ops.charm.RelationBrokenEvent) -> None:
        """Handle a relation-broken event in the nginx-route relation.

        Args:
            event: Event triggering the relation-broken hook for the relation.
        """
        if not self._charm.model.unit.is_leader():
            return

        # Create an event that our charm can use to remove the Kubernetes Nginx ingress resources.
        self.on.nginx_route_broken.emit(event.relation)


# This is here only to maintain a reference to the instance of NginxRouteProvider created by
# the provide_nginx_route function. This is required for ops framework event handling to work.
# The provider instance will have the same lifetime as the charm that creates it.
__provider_references: weakref.WeakKeyDictionary = weakref.WeakKeyDictionary()


def provide_nginx_route(
    charm: ops.charm.CharmBase,
    on_nginx_route_available: typing.Callable,
    on_nginx_route_broken: typing.Callable,
    nginx_route_relation_name: str = "nginx-route",
) -> None:
    """Set up nginx-route relation handlers on the provider side.

    This function must be invoked in the charm class constructor.

    Args:
        charm: The charm that requires the nginx-route relation.
        on_nginx_route_available: Callback function for the nginx-route-available event.
        on_nginx_route_broken: Callback function for the nginx-route-broken event.
        nginx_route_relation_name: Specifies the relation name of the relation handled by this
            provider class. The relation must have the nginx-route interface.

    Raises:
        RuntimeError: If provide_nginx_route was invoked twice with
            the same nginx-route relation name
    """
    ref_dict: typing.Dict[str, typing.Any] = __provider_references.get(charm, {})
    if ref_dict.get(nginx_route_relation_name) is not None:
        raise RuntimeError(
            "provide_nginx_route was invoked twice with the same nginx-route relation name"
        )
    provider = _NginxRouteProvider(
        charm=charm, nginx_route_relation_name=nginx_route_relation_name
    )
    if charm in __provider_references:
        __provider_references[charm][nginx_route_relation_name] = provider
    else:
        __provider_references[charm] = {nginx_route_relation_name: provider}
    charm.framework.observe(provider.on.nginx_route_available, on_nginx_route_available)
    charm.framework.observe(provider.on.nginx_route_broken, on_nginx_route_broken)
