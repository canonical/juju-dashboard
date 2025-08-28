import os
from pathlib import Path
from jinja2 import Environment, FileSystemLoader


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
    ):
        self._config_dir = config_dir
        self._controller_url = controller_url
        self._identity_provider_url = identity_provider_url
        self._is_juju = is_juju
        self._dashboard_root = dashboard_root
        self._analytics_enabled = analytics_enabled
        self._port = port

    def generate(self):
        env = Environment(loader=FileSystemLoader(self._config_dir))
        env.filters["bool"] = to_bool
        config_template = env.get_template("config.js.j2")
        config = config_template.render(
            base_app_url="/",
            controller_api_endpoint=f"{'' if self._is_juju else self._controller_url}/api",
            identity_provider_url=self._identity_provider_url,
            is_juju=self._is_juju,
            analytics_enabled=self._analytics_enabled,
        )
        nginx_template = env.get_template("nginx.conf.j2")
        # Nginx proxy_pass expects the protocol to be https.
        controller_url = self._controller_url.replace("wss://", "https://")
        if not controller_url.startswith("https://"):
            controller_url = "https://{}".format(controller_url)
        nginx_config = nginx_template.render(
            controller_ws_api=controller_url,
            dashboard_root=self._dashboard_root,
            port=self._port,
            is_juju=self._is_juju,
        )
        return config, nginx_config

    def write(self):
        dashboard_config, nginx_config = self.generate()
        config_path = Path(self._dashboard_root) / "config.js"
        config_path.write_text(dashboard_config)
        nginx_path = Path("/etc/nginx/sites-available/default")
        nginx_path.write_text(nginx_config)


if __name__ == "__main__":
    controller_url = os.environ.get("DASHBOARD_CONTROLLER_URL")
    if controller_url is None:
        raise Exception("DASHBOARD_CONTROLLER_URL environment variable not provided")
    dashboard_root = getattr(os.environ, "DASHBOARD_ROOT", "/srv")
    config = Config(
        config_dir=os.environ.get("DASHBOARD_CONFIG_DIR", "/srv"),
        controller_url=controller_url,
        identity_provider_url=os.environ.get("DASHBOARD_IDENTITY_PROVIDER_URL", None),
        is_juju=to_bool(os.environ.get("DASHBOARD_IS_JUJU", True)),
        analytics_enabled=to_bool(os.environ.get("DASHBOARD_ANALYTICS_ENABLED", True)),
        dashboard_root=dashboard_root,
        port=int(os.environ.get("DASHBOARD_PORT", 8080)),
    )
    config.write()
