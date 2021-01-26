const configResponse = {
  application: "containerd",
  charm: "containerd",
  config: {
    "custom-registry-ca": {
      default: "",
      description:
        "Base64 encoded Certificate Authority (CA) bundle. Setting this config\nallows container runtimes to pull images from registries with TLS\ncertificates signed by an external CA.\n",
      source: "default",
      type: "string",
      value: "",
    },
    custom_registries: {
      default: "[]",
      description:
        "Registry endpoints and credentials. Setting this config allows Kubelet\nto pull images from registries where auth is required.\nThe value for this config must be a JSON array of registry info, like this:\n  '[{\"host\": \"my_registry_1\", \"url\": \"http://my.registry:port\"}]'.\n`host` could be registry host address, e.g.:  myregistry.io:9000, 10.10.10.10:5432.\nor a name, e.g.: myregistry.io, myregistry.\nIt will be derived from `url` if not provided, e.g.:\n  url: http://10.10.10.10:8000 --> host: 10.10.10.10:8000\nIf required, you can supply credentials with option keys 'username' and 'password',\nor 'ca_file', 'cert_file', and 'key_file' for ssl/tls communication,\nwhich should be base64 encoded file contents in string form\n\n\"ca_file\": \"'$(base64 < my.custom.registry.pem)'\"\n",
      source: "default",
      type: "string",
      value: "[]",
    },
    "disable-juju-proxy": {
      default: false,
      description:
        "Ignore juju-http(s) proxy settings on this charm.\nIf set to true, all juju https proxy settings will be ignored\n",
      source: "default",
      type: "boolean",
      value: false,
    },
    "enable-cgroups": {
      default: false,
      description:
        "Enable GRUB cgroup overrides cgroup_enable=memory swapaccount=1. WARNING\nchanging this option will reboot the host - use with caution on production\nservices.\n",
      source: "default",
      type: "boolean",
      value: false,
    },
    gpu_driver: {
      default: "auto",
      description:
        'Override GPU driver installation.  Options are "auto", "nvidia", "none".\n',
      source: "default",
      type: "string",
      value: "auto",
    },
    http_proxy: {
      default: "",
      description:
        "URL to use for HTTP_PROXY to be used by Containerd. Useful in\negress-filtered environments where a proxy is the only option for\naccessing the registry to pull images.\n",
      source: "default",
      type: "string",
      value: "",
    },
    https_proxy: {
      default: "",
      description:
        "URL to use for HTTPS_PROXY to be used by Containerd. Useful in\negress-filtered environments where a proxy is the only option for\naccessing the registry to pull images.\n",
      source: "default",
      type: "string",
      value: "",
    },
    no_proxy: {
      default: "",
      description:
        "Comma-separated list of destinations (either domain names or IP\naddresses) which should be accessed directly, rather than through\nthe proxy defined in http_proxy or https_proxy. Must be less than\n2023 characters long.\n",
      source: "default",
      type: "string",
      value: "",
    },
    runtime: {
      default: "auto",
      description:
        'Set a custom containerd runtime.  Set "auto" to select based on hardware.\n',
      source: "default",
      type: "string",
      value: "auto",
    },
    shim: {
      default: "containerd-shim",
      description: "Set a custom containerd shim.\n",
      source: "default",
      type: "string",
      value: "containerd-shim",
    },
  },
  "application-config": {
    trust: {
      default: false,
      description: "Does this application have access to trusted credentials",
      source: "default",
      type: "bool",
      value: false,
    },
  },
  constraints: {},
  series: "focal",
  channel: "",
  "endpoint-bindings": {
    "": "alpha",
    containerd: "alpha",
    "docker-registry": "alpha",
    untrusted: "alpha",
  },
};

export default configResponse;
