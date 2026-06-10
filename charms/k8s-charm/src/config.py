import logging
import os
from pathlib import Path

from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)


def to_bool(boolean_variable) -> bool:
    if type(boolean_variable) is str:
        return boolean_variable.lower() == "true"
    return boolean_variable


class Config:
    def __init__(
        self,
        config_dir: str,
        controller_url: str,
        identity_provider_url: str | None,
        is_juju: bool,
        dashboard_root: str,
        analytics_enabled: bool,
        port: int,
        base_app_url: str | None = None,
        config_file_name: str | None = None,
        has_external_controller_url=False,
    ):
        self._config_dir = config_dir
        self._config_file_name = config_file_name
        self._controller_url = controller_url
        self._identity_provider_url = identity_provider_url
        self._is_juju = is_juju
        self._dashboard_root = dashboard_root
        self._analytics_enabled = analytics_enabled
        self._port = port
        self._has_external_controller_url = has_external_controller_url
        self._base_app_url = base_app_url

    def generate(self):
        env = Environment(loader=FileSystemLoader(self._config_dir))
        env.filters["bool"] = to_bool
        config_template = env.get_template("config.js.j2")
        controller_base_url = (
            self._base_app_url
            if self._is_juju and not self._has_external_controller_url
            else self._controller_url
        )
        config = config_template.render(
            base_app_url=self._base_app_url,
            controller_api_endpoint=f"{controller_base_url}/api",
            identity_provider_url=self._identity_provider_url or "",
            is_juju=self._is_juju,
            analytics_enabled=self._analytics_enabled,
        )
        nginx_template = env.get_template("nginx.conf.j2")
        # Nginx proxy_pass expects the protocol to be https.
        controller_url = self._controller_url.replace("wss://", "https://")
        if not controller_url.startswith("https://"):
            controller_url = "https://{}".format(controller_url)
        nginx_config = nginx_template.render(
            base_app_url=self._base_app_url,
            controller_ws_api=controller_url,
            dashboard_root=self._dashboard_root,
            port=self._port,
            is_juju=self._is_juju,
        )
        index_template = env.get_template("index.charm.html")
        base_app_url = (
            self._base_app_url
            if self._base_app_url is None or self._base_app_url.endswith("/")
            else f"{self._base_app_url}/"
        )
        index_html = index_template.render(
            base_app_url=base_app_url,
        )
        return config, nginx_config, index_html

    def write(self, write_config_js=True, write_nginx=True, write_index=True):
        dashboard_config, nginx_config, index_html = self.generate()
        if write_config_js:
            config_path = Path(self._dashboard_root) / (
                self._config_file_name or "config.js"
            )
            config_path.write_text(dashboard_config)
        if write_index:
            config_path = Path(self._dashboard_root) / "index.html"
            config_path.write_text(index_html)
        if write_nginx:
            nginx_path = Path("/etc/nginx/sites-available/default")
            nginx_path.write_text(nginx_config)


if __name__ == "__main__":
    controller_url = os.environ.get("DASHBOARD_CONTROLLER_URL")
    if controller_url is None:
        logger.debug(
            "DASHBOARD_CONTROLLER_URL environment variable not provided. "
            "Generating configs will be skipped."
        )
    else:
        config = Config(
            config_dir=os.environ.get("DASHBOARD_CONFIG_DIR", "/srv"),
            config_file_name=os.environ.get("DASHBOARD_CONFIG_NAME", "config.js"),
            controller_url=controller_url,
            identity_provider_url=os.environ.get(
                "DASHBOARD_IDENTITY_PROVIDER_URL", None
            ),
            is_juju=to_bool(os.environ.get("DASHBOARD_IS_JUJU", True)),
            analytics_enabled=to_bool(
                os.environ.get("DASHBOARD_ANALYTICS_ENABLED", True)
            ),
            dashboard_root=os.environ.get("DASHBOARD_ROOT", "/srv"),
            port=int(os.environ.get("DASHBOARD_PORT", 8080)),
            has_external_controller_url=to_bool(
                os.environ.get("HAS_EXTERNAL_CONTROLLER_URL", False)
            ),
        )
        config.write(
            write_config_js=to_bool(os.environ.get("WRITE_CONFIG_JS", True)),
            write_nginx=to_bool(os.environ.get("WRITE_NGINX", True)),
            write_index=to_bool(os.environ.get("WRITE_INDEX", True)),
        )
