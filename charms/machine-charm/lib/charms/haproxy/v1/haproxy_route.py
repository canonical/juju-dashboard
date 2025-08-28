# pylint: disable=too-many-lines
"""Haproxy-route interface library.

## Getting Started

To get started using the library, you just need to fetch the library using `charmcraft`.

```shell
cd some-charm
charmcraft fetch-lib charms.haproxy.v1.haproxy_route
```

In the `metadata.yaml` of the charm, add the following:

```yaml
requires:
    backend:
        interface: haproxy-route
        limit: 1
```

Then, to initialise the library:

```python
from charms.haproxy.v1.haproxy_route import HaproxyRouteRequirer

class SomeCharm(CharmBase):
  def __init__(self, *args):
    # ...

    # There are 2 ways you can use the requirer implementation:
    # 1. To initialize the requirer with parameters:
    self.haproxy_route_requirer = HaproxyRouteRequirer(self,
        relation_name=<required>,
        service=<optional>,
        ports=<optional>,
        protocol=<optional>,
        hosts=<optional>,
        paths=<optional>,
        hostname=<optional>,
        additional_hostnames=<optional>,
        check_interval=<optional>,
        check_rise=<optional>,
        check_fall=<optional>,
        check_path=<optional>,
        check_port=<optional>,
        path_rewrite_expressions=<optional>, list of path rewrite expressions,
        query_rewrite_expressions=<optional>, list of query rewrite expressions,
        header_rewrite_expressions=<optional>, list of (header_name, rewrite_expression),
        load_balancing_algorithm=<optional>, defaults to "leastconn",
        load_balancing_cookie=<optional>, only used when load_balancing_algorithm is cookie
        load_balancing_consistent_hashing=<optional>, to enable consistent hashing,
            defaults to False,
        rate_limit_connections_per_minute=<optional>,
        rate_limit_policy=<optional>,
        upload_limit=<optional>,
        download_limit=<optional>,
        retry_count=<optional>,
        retry_redispatch=<optional>,
        deny_paths=<optional>,
        server_timeout=<optional>,
        connect_timeout=<optional>,
        queue_timeout=<optional>,
        server_maxconn=<optional>,
        unit_address=<optional>,
        http_server_close=<optional>,
    )

    # 2.To initialize the requirer with no parameters, i.e
    # self.haproxy_route_requirer = HaproxyRouteRequirer(self)
    # This will simply initialize the requirer class and it won't perfom any action.

    # Afterwards regardless of how you initialized the requirer you can call the
    # provide_haproxy_route_requirements method anywhere in your charm to update the requirer data.
    # The method takes the same number of parameters as the requirer class.
    # provide_haproxy_route_requirements(address=, port=, ...)

    self.framework.observe(
        self.framework.on.config_changed, self._on_config_changed
    )
    self.framework.observe(
        self.haproxy_route_requirer.on.ready, self._on_endpoints_ready
    )
    self.framework.observe(
        self.haproxy_route_requirer.on.removed, self._on_endpoints_removed
    )

    def _on_config_changed(self, event: ConfigChangedEvent) -> None:
        self.haproxy_route_requirer.provide_haproxy_route_requirements(...)

    def _on_endpoints_ready(self, _: EventBase) -> None:
        # Handle endpoints ready event
        ...

    def _on_endpoints_removed(self, _: EventBase) -> None:
        # Handle endpoints removed event
        ...

## Using the library as the provider
The provider charm should expose the interface as shown below:
```yaml
provides:
    haproxy-route:
        interface: haproxy-route
```
Note that this interface supports relating to multiple endpoints.

Then, to initialise the library:
```python
from charms.haproxy.v1.haproxy_route import HaproxyRouteProvider

class SomeCharm(CharmBase):
    self.haproxy_route_provider = HaproxyRouteProvider(self)
    self.framework.observe(
        self.haproxy_route_provider.on.data_available, self._on_haproxy_route_data_available
    )

    def _on_haproxy_route_data_available(self, event: EventBase) -> None:
        data = self.haproxy_route_provider.get_data(self.haproxy_route_provider.relations)
        ...
"""

import json
import logging
from enum import Enum
from typing import Annotated, Any, Literal, MutableMapping, Optional, cast

from ops import CharmBase, ModelError, RelationBrokenEvent
from ops.charm import CharmEvents
from ops.framework import EventBase, EventSource, Object
from ops.model import Relation
from pydantic import (
    AnyHttpUrl,
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    IPvAnyAddress,
    ValidationError,
    field_validator,
    model_validator,
)
from pydantic.dataclasses import dataclass
from typing_extensions import Self

# The unique Charmhub library identifier, never change it
LIBID = "08b6347482f6455486b5f5bb4dc4e6cf"

# Increment this major API version when introducing breaking changes
LIBAPI = 1

# Increment this PATCH version before using `charmcraft publish-lib` or reset
# to 0 if you are raising the major API version
LIBPATCH = 6

logger = logging.getLogger(__name__)
HAPROXY_ROUTE_RELATION_NAME = "haproxy-route"
HAPROXY_CONFIG_INVALID_CHARACTERS = "\n\t#\\'\"\r$ "


def value_contains_invalid_characters(value: Optional[str]) -> Optional[str]:
    """Validate if value contains invalid haproxy config characters.

    Args:
        value: The value to validate.

    Raises:
        ValueError: When value contains invalid characters.

    Returns:
        The validated value.
    """
    if value is None:
        return value

    if [char for char in value if char in HAPROXY_CONFIG_INVALID_CHARACTERS]:
        raise ValueError(f"Relation data contains invalid character(s) {value}")
    return value


VALIDSTR = Annotated[str, BeforeValidator(value_contains_invalid_characters)]


class DataValidationError(Exception):
    """Raised when data validation fails."""


class HaproxyRouteInvalidRelationDataError(Exception):
    """Rasied when data validation of the haproxy-route relation fails."""


class _DatabagModel(BaseModel):
    """Base databag model.

    Attrs:
        model_config: pydantic model configuration.
    """

    model_config = ConfigDict(
        # tolerate additional keys in databag
        extra="ignore",
        # Allow instantiating this class by field name (instead of forcing alias).
        populate_by_name=True,
        # Custom config key: whether to nest the whole datastructure (as json)
        # under a field or spread it out at the toplevel.
        _NEST_UNDER=None,
    )  # type: ignore
    """Pydantic config."""

    @classmethod
    def load(cls, databag: MutableMapping) -> "_DatabagModel":
        """Load this model from a Juju json databag.

        Args:
            databag: Databag content.

        Raises:
            DataValidationError: When model validation failed.

        Returns:
            _DatabagModel: The validated model.
        """
        nest_under = cls.model_config.get("_NEST_UNDER")
        if nest_under:
            return cls.model_validate(json.loads(databag[nest_under]))

        try:
            data = {
                k: json.loads(v)
                for k, v in databag.items()
                # Don't attempt to parse model-external values
                if k in {(f.alias or n) for n, f in cls.model_fields.items()}
            }
        except json.JSONDecodeError as e:
            msg = f"invalid databag contents: expecting json. {databag}"
            logger.error(msg)
            raise DataValidationError(msg) from e

        try:
            return cls.model_validate_json(json.dumps(data))
        except ValidationError as e:
            msg = f"failed to validate databag: {databag}"
            logger.error(str(e), exc_info=True)
            raise DataValidationError(msg) from e

    @classmethod
    def from_dict(cls, values: dict) -> "_DatabagModel":
        """Load this model from a dict.

        Args:
            values: Dict values.

        Raises:
            DataValidationError: When model validation failed.

        Returns:
            _DatabagModel: The validated model.
        """
        try:
            logger.info("Loading values from dictionary: %s", values)
            return cls.model_validate(values)
        except ValidationError as e:
            msg = f"failed to validate: {values}"
            logger.debug(msg, exc_info=True)
            raise DataValidationError(msg) from e

    def dump(
        self, databag: Optional[MutableMapping] = None, clear: bool = True
    ) -> Optional[MutableMapping]:
        """Write the contents of this model to Juju databag.

        Args:
            databag: The databag to write to.
            clear: Whether to clear the databag before writing.

        Returns:
            MutableMapping: The databag.
        """
        if clear and databag:
            databag.clear()

        if databag is None:
            databag = {}
        nest_under = self.model_config.get("_NEST_UNDER")
        if nest_under:
            databag[nest_under] = self.model_dump_json(
                by_alias=True,
                # skip keys whose values are default
                exclude_defaults=True,
            )
            return databag

        dct = self.model_dump(mode="json", by_alias=True, exclude_defaults=True)
        databag.update({k: json.dumps(v) for k, v in dct.items()})
        return databag


class ServerHealthCheck(BaseModel):
    """Configuration model for backend server health checks.

    Attributes:
        interval: Number of seconds between consecutive health check attempts.
        rise: Number of consecutive successful health checks required for up.
        fall: Number of consecutive failed health checks required for DOWN.
        path: List of URL paths to use for HTTP health checks.
        port: Customize port value for http-check.
    """

    interval: Optional[int] = Field(
        description="The interval (in seconds) between health checks.", default=None
    )
    rise: Optional[int] = Field(
        description="How many successful health checks before server is considered up.",
        default=None,
    )
    fall: Optional[int] = Field(
        description="How many failed health checks before server is considered down.", default=None
    )
    path: Optional[VALIDSTR] = Field(description="The health check path.", default=None)
    port: Optional[int] = Field(description="The health check port.", default=None)

    @model_validator(mode="after")
    def check_all_required_fields_set(self) -> Self:
        """Check that all required fields for health check are set.

        Raises:
            ValueError: When validation fails.

        Returns:
            The validated model.
        """
        if not bool(self.interval) == bool(self.rise) == bool(self.fall):
            raise ValueError("All three of interval, rise and fall must be set.")
        return self


# tarpit is not yet implemented
class RateLimitPolicy(Enum):
    """Enum of possible rate limiting policies.

    Attrs:
        DENY: deny a client's HTTP request to return a 403 Forbidden error.
        REJECT: closes the connection immediately without sending a response.
        SILENT: disconnects immediately without notifying the client
            that the connection has been closed.
    """

    DENY = "deny"
    REJECT = "reject"
    SILENT = "silent-drop"


class RateLimit(BaseModel):
    """Configuration model for connection rate limiting.

    Attributes:
        connections_per_minute: Number of connections allowed per minute for a client.
        policy: Action to take when the rate limit is exceeded.
    """

    connections_per_minute: int = Field(description="How many connections are allowed per minute.")
    policy: RateLimitPolicy = Field(
        description="Configure the rate limit policy.", default=RateLimitPolicy.DENY
    )


class LoadBalancingAlgorithm(Enum):
    """Enum of possible http_route types.

    Attrs:
        LEASTCONN: The server with the lowest number of connections receives the connection.
        SRCIP: Load balance using the hash of The source IP address.
        ROUNDROBIN: Each server is used in turns, according to their weights.
        COOKIE: Load balance using hash req.cookie(clientid).
    """

    LEASTCONN = "leastconn"
    SRCIP = "source"
    ROUNDROBIN = "roundrobin"
    COOKIE = "cookie"


class LoadBalancingConfiguration(BaseModel):
    """Configuration model for load balancing.

    Attributes:
        algorithm: Algorithm to use for load balancing.
        cookie: Cookie name to use when algorithm is set to cookie.
        consistent_hashing: Use consistent hashing to avoid redirection
            when servers are added/removed.
    """

    algorithm: LoadBalancingAlgorithm = Field(
        description="Configure the load balancing algorithm for the service.",
        default=LoadBalancingAlgorithm.LEASTCONN,
    )
    cookie: Optional[VALIDSTR] = Field(
        description="Only used when algorithm is COOKIE. Define the cookie to load balance on.",
        default=None,
    )
    # Note: Later when the generic LoadBalancingAlgorithm.HASH is implemented this attribute
    # will also apply under that mode.
    consistent_hashing: bool = Field(
        description=(
            "Only used when the `algorithm` is SRCIP or COOKIE. "
            "Use consistent hashing to avoid redirection when servers are added/removed. "
            "Default is False as it usually does not give a balanced distribution."
        ),
        default=False,
    )

    @model_validator(mode="after")
    def validate_attributes(self) -> Self:
        """Check that algorithm-specific configs are only set with their respective algorithm.

        Raises:
            ValueError: When validation fails in one of these cases:
                1. self.cookie is not None when self.algorithm != COOKIE
                2. self.consistent_hashing is True when algorithm is neither COOKIE nor SRCIP

        Returns:
            The validated model.
        """
        if self.cookie is not None and self.algorithm != LoadBalancingAlgorithm.COOKIE:
            raise ValueError("cookie only applies when algorithm is COOKIE.")

        if self.consistent_hashing and self.algorithm not in [
            LoadBalancingAlgorithm.COOKIE,
            LoadBalancingAlgorithm.SRCIP,
        ]:
            raise ValueError("Consistent hashing only applies when algorithm is COOKIE or SRCIP.")
        return self


class BandwidthLimit(BaseModel):
    """Configuration model for bandwidth rate limiting.

    Attributes:
        upload: Limit upload speed (bytes per second).
        download: Limit download speed (bytes per second).
    """

    upload: Optional[int] = Field(description="Upload limit (bytes per seconds).", default=None)
    download: Optional[int] = Field(
        description="Download limit (bytes per seconds).", default=None
    )


# retry-on is not yet implemented
class Retry(BaseModel):
    """Configuration model for retry.

    Attributes:
        count: How many times should a request retry.
        redispatch: Whether to redispatch failed requests to another server.
    """

    count: int = Field(description="How many times should a request retry.")
    redispatch: bool = Field(
        description="Whether to redispatch failed requests to another server.", default=False
    )


class TimeoutConfiguration(BaseModel):
    """Configuration model for timeout.

    Attributes:
        server: Timeout for requests from haproxy to backend servers.
        connect: Timeout for client requests to haproxy.
        queue: Timeout for requests waiting in the queue after server-maxconn is reached.
    """

    server: int = Field(
        description="Timeout (in seconds) for requests from haproxy to backend servers.",
        default=60,
    )
    connect: int = Field(
        description="Timeout (in seconds) for client requests to haproxy.", default=60
    )
    queue: int = Field(
        description="Timeout (in seconds) for requests in the queue.",
        default=60,
    )


class HaproxyRewriteMethod(Enum):
    """Enum of possible HTTP rewrite methods.

    Attrs:
        SET_PATH: The server with the lowest number of connections receives the connection.
        SET_QUERY: Load balance using the hash of The source IP address.
        SET_HEADER: Each server is used in turns, according to their weights.
    """

    SET_PATH = "set-path"
    SET_QUERY = "set-query"
    SET_HEADER = "set-header"


class RewriteConfiguration(BaseModel):
    """Configuration model for HTTP rewrite.

    Attributes:
        method: Which rewrite method to apply.One of set-path, set-query, set-header.
        expression: Regular expression to use with the rewrite method.
        header: The name of the header to rewrited.
    """

    method: HaproxyRewriteMethod = Field(
        description="Which rewrite method to apply.One of set-path, set-query, set-header."
    )
    expression: VALIDSTR = Field(description="Regular expression to use with the rewrite method.")
    header: Optional[VALIDSTR] = Field(
        description="The name of the header to rewrite.", default=None
    )


class RequirerApplicationData(_DatabagModel):
    """Configuration model for HAProxy route requirer application data.

    Attributes:
        service: Name of the service requesting HAProxy routing.
        ports: List of port numbers on which the service is listening.
        protocol: The protocol that the service speaks.
        hosts: List of backend server addresses.
        paths: List of URL paths to route to this service. Defaults to an empty list.
        hostname: Optional: The hostname of this service.
        additional_hostnames: List of additional hostnames of this service.
            Defaults to an empty list.
        rewrites: List of RewriteConfiguration objects defining path, query, or header
            rewrite rules.
        check: ServerHealthCheck configuration for monitoring backend health.
        load_balancing: Configuration for the load balancing strategy.
        rate_limit: Optional configuration for limiting connection rates.
        bandwidth_limit: Optional configuration for limiting upload and download bandwidth.
        retry: Optional configuration for request retry behavior.
        deny_paths: List of URL paths that should not be routed to the backend.
        timeout: Configuration for server, client, and queue timeouts.
        server_maxconn: Optional maximum number of connections per server.
        http_server_close: Configure server close after request.
    """

    service: VALIDSTR = Field(description="The name of the service.")
    ports: list[int] = Field(description="The list of ports listening for this service.")
    protocol: Optional[Literal["http", "https"]] = Field(
        description="The protocol that the service speaks.",
        default="http",
    )
    hosts: list[IPvAnyAddress] = Field(
        description="The list of backend server addresses. Currently only support IP addresses.",
        default=[],
    )
    paths: list[VALIDSTR] = Field(
        description="The list of paths to route to this service.", default=[]
    )
    hostname: Optional[VALIDSTR] = Field(description="Hostname of this service.", default=None)
    additional_hostnames: list[VALIDSTR] = Field(
        description="The list of additional hostnames of this service.", default=[]
    )
    rewrites: list[RewriteConfiguration] = Field(
        description="The list of path rewrite rules.", default=[]
    )
    check: Optional[ServerHealthCheck] = Field(
        description="Configure health check for the service.",
        default=None,
    )
    load_balancing: LoadBalancingConfiguration = Field(
        description="Configure loadbalancing.", default=LoadBalancingConfiguration()
    )
    rate_limit: Optional[RateLimit] = Field(
        description="Configure rate limit for the service.", default=None
    )
    bandwidth_limit: BandwidthLimit = Field(
        description="Configure bandwidth limit for the service.", default=BandwidthLimit()
    )
    retry: Optional[Retry] = Field(
        description="Configure retry for incoming requests.", default=None
    )
    deny_paths: list[VALIDSTR] = Field(
        description="Configure path that should not be routed to the backend", default=[]
    )
    timeout: TimeoutConfiguration = Field(
        description="Configure timeout",
        default=TimeoutConfiguration(),
    )
    server_maxconn: Optional[int] = Field(
        description="Configure maximum connection per server", default=None
    )
    http_server_close: bool = Field(
        description="Configure server close after request", default=False
    )

    @field_validator("load_balancing")
    @classmethod
    def validate_load_balancing_configuration(
        cls, configuration: LoadBalancingConfiguration
    ) -> LoadBalancingConfiguration:
        """Validate the parsed load balancing configuration.

        Args:
            configuration: The configuration to validate.

        Raises:
            ValueError: When cookie is not set under COOKIE load balancing mode.

        Returns:
            LoadBalancingConfiguration: The validated configuration.
        """
        if configuration.algorithm == LoadBalancingAlgorithm.COOKIE and not configuration.cookie:
            raise ValueError("cookie must be set if load balacing algorithm is COOKIE.")
        return configuration

    @field_validator("rewrites")
    @classmethod
    def validate_rewrites(cls, rewrites: list[RewriteConfiguration]) -> list[RewriteConfiguration]:
        """Validate the parsed list of rewrite configurations.

        Args:
            rewrites: The configurations to validate.

        Raises:
            ValueError: When header is not set under SET_HEADER rewrite method.

        Returns:
            list[RewriteConfiguration]: The validated configurations.
        """
        for rewrite in rewrites:
            if rewrite.method == HaproxyRewriteMethod.SET_HEADER and not rewrite.method:
                raise ValueError("header must be set if rewrite method is SET_HEADER.")
        return rewrites


class HaproxyRouteProviderAppData(_DatabagModel):
    """haproxy-route provider databag schema.

    Attributes:
        endpoints: The list of proxied endpoints that maps to the backend.
    """

    endpoints: list[AnyHttpUrl]


class RequirerUnitData(_DatabagModel):
    """haproxy-route requirer unit data.

    Attributes:
        address: IP address of the unit.
    """

    address: IPvAnyAddress = Field(description="IP address of the unit.")


@dataclass
class HaproxyRouteRequirerData:
    """haproxy-route requirer data.

    Attributes:
        relation_id: Id of the relation.
        application_data: Application data.
        units_data: Units data
    """

    relation_id: int
    application_data: RequirerApplicationData
    units_data: list[RequirerUnitData]


@dataclass
class HaproxyRouteRequirersData:
    """haproxy-route requirers data.

    Attributes:
        requirers_data: List of requirer data.
        relation_ids_with_invalid_data: List of relation ids that contains invalid data.
    """

    requirers_data: list[HaproxyRouteRequirerData]
    relation_ids_with_invalid_data: list[int]

    @model_validator(mode="after")
    def check_services_unique(self) -> Self:
        """Check that requirers define unique services.

        Raises:
            DataValidationError: When requirers declared duplicate services.

        Returns:
            The validated model.
        """
        services = [
            requirer_data.application_data.service for requirer_data in self.requirers_data
        ]
        if len(services) != len(set(services)):
            raise DataValidationError("Services declaration by requirers must be unique.")

        return self


class HaproxyRouteDataAvailableEvent(EventBase):
    """HaproxyRouteDataAvailableEvent custom event.

    This event indicates that the requirers data are available.
    """


class HaproxyRouteDataRemovedEvent(EventBase):
    """HaproxyRouteDataRemovedEvent custom event.

    This event indicates that one of the endpoints was removed.
    """


class HaproxyRouteProviderEvents(CharmEvents):
    """List of events that the TLS Certificates requirer charm can leverage.

    Attributes:
        data_available: This event indicates that
            the haproxy-route endpoints are available.
        data_removed: This event indicates that one of the endpoints was removed.
    """

    data_available = EventSource(HaproxyRouteDataAvailableEvent)
    data_removed = EventSource(HaproxyRouteDataRemovedEvent)


class HaproxyRouteProvider(Object):
    """Haproxy-route interface provider implementation.

    Attributes:
        on: Custom events of the provider.
        relations: Related appliations.
    """

    on = HaproxyRouteProviderEvents()

    def __init__(
        self,
        charm: CharmBase,
        relation_name: str = HAPROXY_ROUTE_RELATION_NAME,
        raise_on_validation_error: bool = False,
    ) -> None:
        """Initialize the HaproxyRouteProvider.

        Args:
            charm: The charm that is instantiating the library.
            relation_name: The name of the relation.
            raise_on_validation_error: Whether the library should raise
                HaproxyRouteInvalidRelationDataError when requirer data validation fails.
                If this is set to True the provider charm needs to also catch and handle the
                thrown exception.
        """
        super().__init__(charm, relation_name)

        self._relation_name = relation_name
        self.charm = charm
        self.raise_on_validation_error = raise_on_validation_error
        on = self.charm.on
        self.framework.observe(on[self._relation_name].relation_created, self._configure)
        self.framework.observe(on[self._relation_name].relation_changed, self._configure)
        self.framework.observe(on[self._relation_name].relation_broken, self._on_endpoint_removed)
        self.framework.observe(
            on[self._relation_name].relation_departed, self._on_endpoint_removed
        )

    @property
    def relations(self) -> list[Relation]:
        """The list of Relation instances associated with this endpoint."""
        return list(self.charm.model.relations[self._relation_name])

    def _configure(self, _event: EventBase) -> None:
        """Handle relation events."""
        if relations := self.relations:
            # Only for data validation
            _ = self.get_data(relations)
            self.on.data_available.emit()

    def _on_endpoint_removed(self, _: EventBase) -> None:
        """Handle relation broken/departed events."""
        self.on.data_removed.emit()

    def get_data(self, relations: list[Relation]) -> HaproxyRouteRequirersData:
        """Fetch requirer data.

        Args:
            relations: A list of Relation instances to fetch data from.

        Raises:
            HaproxyRouteInvalidRelationDataError: When requirer data validation fails.

        Returns:
            HaproxyRouteRequirersData: Validated data from all haproxy-route requirers.
        """
        requirers_data: list[HaproxyRouteRequirerData] = []
        relation_ids_with_invalid_data: list[int] = []
        for relation in relations:
            try:
                application_data = self._get_requirer_application_data(relation)
                units_data = self._get_requirer_units_data(relation)
                haproxy_route_requirer_data = HaproxyRouteRequirerData(
                    application_data=application_data,
                    units_data=units_data,
                    relation_id=relation.id,
                )
                requirers_data.append(haproxy_route_requirer_data)
            except DataValidationError as exc:
                if self.raise_on_validation_error:
                    logger.error(
                        "haproxy-route data validation failed for relation %s: %s",
                        relation,
                        str(exc),
                    )
                    raise HaproxyRouteInvalidRelationDataError(
                        f"haproxy-route data validation failed for relation: {relation}"
                    ) from exc
                relation_ids_with_invalid_data.append(relation.id)
                continue
        return HaproxyRouteRequirersData(
            requirers_data=requirers_data,
            relation_ids_with_invalid_data=relation_ids_with_invalid_data,
        )

    def _get_requirer_units_data(self, relation: Relation) -> list[RequirerUnitData]:
        """Fetch and validate the requirer's units data.

        Args:
            relation: The relation to fetch unit data from.

        Raises:
            DataValidationError: When unit data validation fails.

        Returns:
            list[RequirerUnitData]: List of validated unit data from the requirer.
        """
        requirer_units_data: list[RequirerUnitData] = []

        for unit in relation.units:
            databag = relation.data.get(unit)
            if not databag:
                logger.error(
                    "Requirer unit data does not exist even though the unit is still present."
                )
                continue
            try:
                data = cast(RequirerUnitData, RequirerUnitData.load(databag))
                requirer_units_data.append(data)
            except DataValidationError:
                logger.error("Invalid requirer application data for %s", unit)
                raise
        return requirer_units_data

    def _get_requirer_application_data(self, relation: Relation) -> RequirerApplicationData:
        """Fetch and validate the requirer's application databag.

        Args:
            relation: The relation to fetch application data from.

        Raises:
            DataValidationError: When requirer application data validation fails.

        Returns:
            RequirerApplicationData: Validated application data from the requirer.
        """
        try:
            return cast(
                RequirerApplicationData, RequirerApplicationData.load(relation.data[relation.app])
            )
        except DataValidationError:
            logger.error("Invalid requirer application data for %s", relation.app.name)
            raise

    def publish_proxied_endpoints(self, endpoints: list[str], relation: Relation) -> None:
        """Publish to the app databag the proxied endpoints.

        Args:
            endpoints: The list of proxied endpoints to publish.
            relation: The relation with the requirer application.
        """
        HaproxyRouteProviderAppData(
            endpoints=list(map(lambda x: cast(AnyHttpUrl, x), endpoints))
        ).dump(relation.data[self.charm.app], clear=True)


class HaproxyRouteEnpointsReadyEvent(EventBase):
    """HaproxyRouteEnpointsReadyEvent custom event."""


class HaproxyRouteEndpointsRemovedEvent(EventBase):
    """HaproxyRouteEndpointsRemovedEvent custom event."""


class HaproxyRouteRequirerEvents(CharmEvents):
    """List of events that the TLS Certificates requirer charm can leverage.

    Attributes:
        ready: when the provider proxied endpoints are ready.
        removed: when the provider
    """

    ready = EventSource(HaproxyRouteEnpointsReadyEvent)
    removed = EventSource(HaproxyRouteEndpointsRemovedEvent)


class HaproxyRouteRequirer(Object):
    """haproxy-route interface requirer implementation.

    Attributes:
        on: Custom events of the requirer.
    """

    on = HaproxyRouteRequirerEvents()

    # pylint: disable=too-many-arguments,too-many-positional-arguments,too-many-locals
    def __init__(
        self,
        charm: CharmBase,
        relation_name: str,
        service: Optional[str] = None,
        ports: Optional[list[int]] = None,
        protocol: Literal["http", "https"] = "http",
        hosts: Optional[list[str]] = None,
        paths: Optional[list[str]] = None,
        hostname: Optional[str] = None,
        additional_hostnames: Optional[list[str]] = None,
        check_interval: Optional[int] = None,
        check_rise: Optional[int] = None,
        check_fall: Optional[int] = None,
        check_path: Optional[str] = None,
        check_port: Optional[int] = None,
        path_rewrite_expressions: Optional[list[str]] = None,
        query_rewrite_expressions: Optional[list[str]] = None,
        header_rewrite_expressions: Optional[list[tuple[str, str]]] = None,
        load_balancing_algorithm: LoadBalancingAlgorithm = LoadBalancingAlgorithm.LEASTCONN,
        load_balancing_cookie: Optional[str] = None,
        load_balancing_consistent_hashing: bool = False,
        rate_limit_connections_per_minute: Optional[int] = None,
        rate_limit_policy: RateLimitPolicy = RateLimitPolicy.DENY,
        upload_limit: Optional[int] = None,
        download_limit: Optional[int] = None,
        retry_count: Optional[int] = None,
        retry_redispatch: bool = False,
        deny_paths: Optional[list[str]] = None,
        server_timeout: int = 60,
        connect_timeout: int = 60,
        queue_timeout: int = 60,
        server_maxconn: Optional[int] = None,
        unit_address: Optional[str] = None,
        http_server_close: bool = False,
    ) -> None:
        """Initialize the HaproxyRouteRequirer.

        Args:
            charm: The charm that is instantiating the library.
            relation_name: The name of the relation to bind to.
            service: The name of the service to route traffic to.
            ports: List of ports the service is listening on.
            protocol: The protocol that the service speaks.
            hosts: List of backend server addresses. Currently only support IP addresses.
            paths: List of URL paths to route to this service.
            hostname: Hostname of this service.
            additional_hostnames: Additional hostnames of this service.
            check_interval: Interval between health checks in seconds.
            check_rise: Number of successful health checks before server is considered up.
            check_fall: Number of failed health checks before server is considered down.
            check_path: The path to use for server health checks.
            check_port: The port to use for http-check.
            path_rewrite_expressions: List of regex expressions for path rewrites.
            query_rewrite_expressions: List of regex expressions for query rewrites.
            header_rewrite_expressions: List of tuples containing header name
                and rewrite expression.
            load_balancing_algorithm: Algorithm to use for load balancing.
            load_balancing_cookie: Cookie name to use when algorithm is set to cookie.
            load_balancing_consistent_hashing: Whether to use consistent hashing.
            rate_limit_connections_per_minute: Maximum connections allowed per minute.
            rate_limit_policy: Policy to apply when rate limit is reached.
            upload_limit: Maximum upload bandwidth in bytes per second.
            download_limit: Maximum download bandwidth in bytes per second.
            retry_count: Number of times to retry failed requests.
            retry_redispatch: Whether to redispatch failed requests to another server.
            deny_paths: List of paths that should not be routed to the backend.
            server_timeout: Timeout for requests from haproxy to backend servers in seconds.
            connect_timeout: Timeout for client requests to haproxy in seconds.
            queue_timeout: Timeout for requests waiting in queue in seconds.
            server_maxconn: Maximum connections per server.
            unit_address: IP address of the unit (if not provided, will use binding address).
            http_server_close: Configure server close after request.
        """
        super().__init__(charm, relation_name)

        self._relation_name = relation_name
        self.relation = self.model.get_relation(self._relation_name)
        self.charm = charm
        self.app = self.charm.app

        # build the full application data
        self._application_data = self._generate_application_data(
            service,
            ports,
            protocol,
            hosts,
            paths,
            hostname,
            additional_hostnames,
            check_interval,
            check_rise,
            check_fall,
            check_path,
            check_port,
            path_rewrite_expressions,
            query_rewrite_expressions,
            header_rewrite_expressions,
            load_balancing_algorithm,
            load_balancing_cookie,
            load_balancing_consistent_hashing,
            rate_limit_connections_per_minute,
            rate_limit_policy,
            upload_limit,
            download_limit,
            retry_count,
            retry_redispatch,
            deny_paths,
            server_timeout,
            connect_timeout,
            queue_timeout,
            server_maxconn,
            http_server_close,
        )
        self._unit_address = unit_address

        on = self.charm.on
        self.framework.observe(on[self._relation_name].relation_created, self._configure)
        self.framework.observe(on[self._relation_name].relation_changed, self._configure)
        self.framework.observe(on[self._relation_name].relation_broken, self._on_relation_broken)

    def _configure(self, _: EventBase) -> None:
        """Handle relation events."""
        self.update_relation_data()
        if self.relation and self.get_proxied_endpoints():
            # This event is only emitted when the provider databag changes
            # which only happens when relevant changes happened
            # Additionally this event is purely informational and it's up to the requirer to
            # fetch the proxied endpoints in their code using get_proxied_endpoints
            self.on.ready.emit()

    def _on_relation_broken(self, _: RelationBrokenEvent) -> None:
        """Handle relation broken event."""
        self.on.removed.emit()

    # pylint: disable=too-many-arguments,too-many-positional-arguments
    def provide_haproxy_route_requirements(
        self,
        service: str,
        ports: list[int],
        protocol: Literal["http", "https"] = "http",
        hosts: Optional[list[str]] = None,
        paths: Optional[list[str]] = None,
        hostname: Optional[str] = None,
        additional_hostnames: Optional[list[str]] = None,
        check_interval: Optional[int] = None,
        check_rise: Optional[int] = None,
        check_fall: Optional[int] = None,
        check_path: Optional[str] = None,
        check_port: Optional[int] = None,
        path_rewrite_expressions: Optional[list[str]] = None,
        query_rewrite_expressions: Optional[list[str]] = None,
        header_rewrite_expressions: Optional[list[tuple[str, str]]] = None,
        load_balancing_algorithm: LoadBalancingAlgorithm = LoadBalancingAlgorithm.LEASTCONN,
        load_balancing_cookie: Optional[str] = None,
        load_balancing_consistent_hashing: bool = False,
        rate_limit_connections_per_minute: Optional[int] = None,
        rate_limit_policy: RateLimitPolicy = RateLimitPolicy.DENY,
        upload_limit: Optional[int] = None,
        download_limit: Optional[int] = None,
        retry_count: Optional[int] = None,
        retry_redispatch: bool = False,
        deny_paths: Optional[list[str]] = None,
        server_timeout: int = 60,
        connect_timeout: int = 60,
        queue_timeout: int = 60,
        server_maxconn: Optional[int] = None,
        unit_address: Optional[str] = None,
        http_server_close: bool = False,
    ) -> None:
        """Update haproxy-route requirements data in the relation.

        Args:
            service: The name of the service to route traffic to.
            ports: List of ports the service is listening on.
            protocol: The protocol that the serive speaks, deafults to "http".
            hosts: List of backend server addresses. Currently only support IP addresses.
            paths: List of URL paths to route to this service.
            hostname: Hostname of this service.
            additional_hostnames: Additional hostnames of this service.
            check_interval: Interval between health checks in seconds.
            check_rise: Number of successful health checks before server is considered up.
            check_fall: Number of failed health checks before server is considered down.
            check_path: The path to use for server health checks.
            check_port: The port to use for http-check.
            path_rewrite_expressions: List of regex expressions for path rewrites.
            query_rewrite_expressions: List of regex expressions for query rewrites.
            header_rewrite_expressions: List of tuples containing header name
                and rewrite expression.
            load_balancing_algorithm: Algorithm to use for load balancing.
            load_balancing_cookie: Cookie name to use when algorithm is set to cookie.
            load_balancing_consistent_hashing: Whether to use consistent hashing.
            rate_limit_connections_per_minute: Maximum connections allowed per minute.
            rate_limit_policy: Policy to apply when rate limit is reached.
            upload_limit: Maximum upload bandwidth in bytes per second.
            download_limit: Maximum download bandwidth in bytes per second.
            retry_count: Number of times to retry failed requests.
            retry_redispatch: Whether to redispatch failed requests to another server.
            deny_paths: List of paths that should not be routed to the backend.
            server_timeout: Timeout for requests from haproxy to backend servers in seconds.
            connect_timeout: Timeout for client requests to haproxy in seconds.
            queue_timeout: Timeout for requests waiting in queue in seconds.
            server_maxconn: Maximum connections per server.
            unit_address: IP address of the unit (if not provided, will use binding address).
            http_server_close: Configure server close after request.
        """
        self._unit_address = unit_address
        self._application_data = self._generate_application_data(
            service,
            ports,
            protocol,
            hosts,
            paths,
            hostname,
            additional_hostnames,
            check_interval,
            check_rise,
            check_fall,
            check_path,
            check_port,
            path_rewrite_expressions,
            query_rewrite_expressions,
            header_rewrite_expressions,
            load_balancing_algorithm,
            load_balancing_cookie,
            load_balancing_consistent_hashing,
            rate_limit_connections_per_minute,
            rate_limit_policy,
            upload_limit,
            download_limit,
            retry_count,
            retry_redispatch,
            deny_paths,
            server_timeout,
            connect_timeout,
            queue_timeout,
            server_maxconn,
            http_server_close,
        )
        self.update_relation_data()

    # pylint: disable=too-many-arguments,too-many-positional-arguments,too-many-locals
    def _generate_application_data(  # noqa: C901
        self,
        service: Optional[str] = None,
        ports: Optional[list[int]] = None,
        protocol: Literal["http", "https"] = "http",
        hosts: Optional[list[str]] = None,
        paths: Optional[list[str]] = None,
        hostname: Optional[str] = None,
        additional_hostnames: Optional[list[str]] = None,
        check_interval: Optional[int] = None,
        check_rise: Optional[int] = None,
        check_fall: Optional[int] = None,
        check_path: Optional[str] = None,
        check_port: Optional[int] = None,
        path_rewrite_expressions: Optional[list[str]] = None,
        query_rewrite_expressions: Optional[list[str]] = None,
        header_rewrite_expressions: Optional[list[tuple[str, str]]] = None,
        load_balancing_algorithm: LoadBalancingAlgorithm = LoadBalancingAlgorithm.LEASTCONN,
        load_balancing_cookie: Optional[str] = None,
        load_balancing_consistent_hashing: bool = False,
        rate_limit_connections_per_minute: Optional[int] = None,
        rate_limit_policy: RateLimitPolicy = RateLimitPolicy.DENY,
        upload_limit: Optional[int] = None,
        download_limit: Optional[int] = None,
        retry_count: Optional[int] = None,
        retry_redispatch: bool = False,
        deny_paths: Optional[list[str]] = None,
        server_timeout: int = 60,
        connect_timeout: int = 60,
        queue_timeout: int = 60,
        server_maxconn: Optional[int] = None,
        http_server_close: bool = False,
    ) -> dict[str, Any]:
        """Generate the complete application data structure.

        Args:
            service: The name of the service to route traffic to.
            ports: List of ports the service is listening on.
            protocol: The protocol that the service speaks.
            hosts: List of backend server addresses. Currently only support IP addresses.
            paths: List of URL paths to route to this service.
            hostname: Hostname of this service.
            additional_hostnames: Additional hostnames of this service.
            check_interval: Interval between health checks in seconds.
            check_rise: Number of successful health checks before server is considered up.
            check_fall: Number of failed health checks before server is considered down.
            check_path: The path to use for server health checks.
            check_port: The port to use for http-check.
            path_rewrite_expressions: List of regex expressions for path rewrites.
            query_rewrite_expressions: List of regex expressions for query rewrites.
            header_rewrite_expressions: List of tuples containing header name and
                rewrite expression.
            load_balancing_algorithm: Algorithm to use for load balancing.
            load_balancing_cookie: Cookie name to use when algorithm is set to cookie.
            load_balancing_consistent_hashing: Whether to use consistent hashing.
            rate_limit_connections_per_minute: Maximum connections allowed per minute.
            rate_limit_policy: Policy to apply when rate limit is reached.
            upload_limit: Maximum upload bandwidth in bytes per second.
            download_limit: Maximum download bandwidth in bytes per second.
            retry_count: Number of times to retry failed requests.
            retry_redispatch: Whether to redispatch failed requests to another server.
            deny_paths: List of paths that should not be routed to the backend.
            server_timeout: Timeout for requests from haproxy to backend servers in seconds.
            connect_timeout: Timeout for client requests to haproxy in seconds.
            queue_timeout: Timeout for requests waiting in queue in seconds.
            server_maxconn: Maximum connections per server.
            http_server_close: Configure server close after request.

        Returns:
            dict: A dictionary containing the complete application data structure.
        """
        # Apply default value to list parameters to avoid problems with mutable default args.
        if not ports:
            ports = []
        if not hosts:
            hosts = []
        if not paths:
            paths = []
        if not additional_hostnames:
            additional_hostnames = []
        if not path_rewrite_expressions:
            path_rewrite_expressions = []
        if not query_rewrite_expressions:
            query_rewrite_expressions = []
        if not header_rewrite_expressions:
            header_rewrite_expressions = []
        if not deny_paths:
            deny_paths = []

        application_data: dict[str, Any] = {
            "service": service,
            "ports": ports,
            "protocol": protocol,
            "hosts": hosts,
            "paths": paths,
            "hostname": hostname,
            "additional_hostnames": additional_hostnames,
            "load_balancing": {
                "algorithm": load_balancing_algorithm,
                "cookie": load_balancing_cookie,
                "consistent_hashing": load_balancing_consistent_hashing,
            },
            "timeout": {
                "server": server_timeout,
                "connect": connect_timeout,
                "queue": queue_timeout,
            },
            "bandwidth_limit": {
                "download": download_limit,
                "upload": upload_limit,
            },
            "deny_paths": deny_paths,
            "server_maxconn": server_maxconn,
            "rewrites": self._generate_rewrite_configuration(
                path_rewrite_expressions,
                query_rewrite_expressions,
                header_rewrite_expressions,
            ),
            "http_server_close": http_server_close,
        }

        if check := self._generate_server_healthcheck_configuration(
            check_interval, check_rise, check_fall, check_path, check_port
        ):
            application_data["check"] = check

        if rate_limit := self._generate_rate_limit_configuration(
            rate_limit_connections_per_minute, rate_limit_policy
        ):
            application_data["rate_limit"] = rate_limit

        if retry := self._generate_retry_configuration(retry_count, retry_redispatch):
            application_data["retry"] = retry
        return application_data

    def _generate_server_healthcheck_configuration(
        self,
        interval: Optional[int],
        rise: Optional[int],
        fall: Optional[int],
        path: Optional[str],
        port: Optional[int],
    ) -> dict[str, int | Optional[str]]:
        """Generate configuration for server health checks.

        Args:
            interval: Time between health checks in seconds.
            rise: Number of successful checks before marking server as up.
            fall: Number of failed checks before marking server as down.
            path: The path to use for health checks.
            port: The port to use for http-check.

        Returns:
            dict[str, int | Optional[str]]: Health check configuration dictionary.
        """
        server_healthcheck_configuration: dict[str, int | Optional[str]] = {}
        if interval and rise and fall:
            server_healthcheck_configuration = {
                "interval": interval,
                "rise": rise,
                "fall": fall,
                "path": path,
                "port": port,
            }
        return server_healthcheck_configuration

    def _generate_rewrite_configuration(
        self,
        path_rewrite_expressions: list[str],
        query_rewrite_expressions: list[str],
        header_rewrite_expressions: list[tuple[str, str]],
    ) -> list[dict[str, str | HaproxyRewriteMethod]]:
        """Generate rewrite configuration from provided expressions.

        Args:
            path_rewrite_expressions: List of path rewrite expressions.
            query_rewrite_expressions: List of query rewrite expressions.
            header_rewrite_expressions: List of header name and expression tuples.

        Returns:
            list[dict[str, str]]: List of generated rewrite configurations.
        """
        # rewrite configuration
        rewrite_configurations: list[dict[str, str | HaproxyRewriteMethod]] = []
        for expression in path_rewrite_expressions:
            rewrite_configurations.append(
                {"method": HaproxyRewriteMethod.SET_PATH, "expression": expression}
            )
        for expression in query_rewrite_expressions:
            rewrite_configurations.append(
                {"method": HaproxyRewriteMethod.SET_QUERY, "expression": expression}
            )
        for header, expression in header_rewrite_expressions:
            rewrite_configurations.append(
                {
                    "method": HaproxyRewriteMethod.SET_HEADER,
                    "expression": expression,
                    "header": header,
                }
            )
        return rewrite_configurations

    def _generate_rate_limit_configuration(
        self, rate_limit_connections_per_minute: Optional[int], rate_limit_policy: RateLimitPolicy
    ) -> dict[str, Any]:
        """Generate rate limit configuration.

        Args:
            rate_limit_connections_per_minute: Maximum connections allowed per minute.
            rate_limit_policy: Policy to apply when rate limit is reached.

        Returns:
            dict[str, Any]: Rate limit configuration, or empty dict if no limits are set.
        """
        rate_limit_configuration = {}
        if rate_limit_connections_per_minute:
            rate_limit_configuration = {
                "connections_per_minute": rate_limit_connections_per_minute,
                "policy": rate_limit_policy,
            }
        return rate_limit_configuration

    def _generate_retry_configuration(
        self, count: Optional[int], redispatch: bool
    ) -> dict[str, Any]:
        """Generate retry configuration.

        Args:
            count: Number of times to retry failed requests.
            redispatch: Whether to redispatch failed requests to another server.

        Returns:
            dict[str, Any]: Retry configuration dictionary, or empty dict if retry not configured.
        """
        retry_configuration = {}
        if count:
            retry_configuration = {
                "count": count,
                "redispatch": redispatch,
            }
        return retry_configuration

    def update_relation_data(self) -> None:
        """Update both application and unit data in the relation."""
        if not self._application_data.get("service") and not self._application_data.get("ports"):
            logger.warning("Required field(s) are missing, skipping update of the relation data.")
            return

        if relation := self.relation:
            self._update_application_data(relation)
            self._update_unit_data(relation)

    def _update_application_data(self, relation: Relation) -> None:
        """Update application data in the relation databag.

        Args:
            relation: The relation instance.
        """
        if self.charm.unit.is_leader():
            application_data = self._prepare_application_data()
            application_data.dump(relation.data[self.app], clear=True)

    def _update_unit_data(self, relation: Relation) -> None:
        """Prepare and update the unit data in the relation databag.

        Args:
            relation: The relation instance.
        """
        unit_data = self._prepare_unit_data()
        unit_data.dump(relation.data[self.charm.unit], clear=True)

    def _prepare_application_data(self) -> RequirerApplicationData:
        """Prepare and validate the application data.

        Raises:
            DataValidationError: When validation of application data fails.

        Returns:
            RequirerApplicationData: The validated application data model.
        """
        try:
            return cast(
                RequirerApplicationData, RequirerApplicationData.from_dict(self._application_data)
            )
        except ValidationError as exc:
            logger.error("Validation error when preparing requirer application data.")
            raise DataValidationError(
                "Validation error when preparing requirer application data."
            ) from exc

    def _prepare_unit_data(self) -> RequirerUnitData:
        """Prepare and validate unit data.

        Raises:
            DataValidationError: When no address or unit IP is available.

        Returns:
            RequirerUnitData: The validated unit data model.
        """
        address = self._unit_address
        if not address:
            network_binding = self.charm.model.get_binding("juju-info")
            if (
                network_binding is not None
                and (bind_address := network_binding.network.bind_address) is not None
            ):
                address = str(bind_address)
            else:
                logger.error("No unit IP available.")
                raise DataValidationError("No unit IP available.")
        return RequirerUnitData(address=cast(IPvAnyAddress, address))

    def get_proxied_endpoints(self) -> list[AnyHttpUrl]:
        """The full ingress URL to reach the current unit.

        Returns:
            The provider URL or None if the URL isn't available yet or is not valid.
        """
        relation = self.relation
        if not relation or not relation.app:
            return []

        # Fetch the provider's app databag
        try:
            databag = relation.data[relation.app]
        except ModelError:
            logger.exception("Error reading remote app data.")
            return []

        if not databag:  # not ready yet
            return []

        try:
            provider_data = cast(
                HaproxyRouteProviderAppData, HaproxyRouteProviderAppData.load(databag)
            )
            return provider_data.endpoints
        except DataValidationError:
            logger.exception("Invalid provider url.")
            return []
