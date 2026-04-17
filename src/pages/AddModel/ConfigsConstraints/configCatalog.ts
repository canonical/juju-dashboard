type ConfigOption = {
  label: string;
  value: string;
};

type ConfigInputDefinition =
  | {
      type: "boolean";
    }
  | {
      type: "select";
      options: ConfigOption[];
    }
  | {
      type: "string";
      placeholder?: string;
    };

export type ModelConfigDefinition = {
  label: string;
  description: string;
  input: ConfigInputDefinition;
};

type ConfigCategoryDefinition = {
  category: string;
  configs: ModelConfigDefinition[];
};

export const CONFIG_CATEGORIES: ConfigCategoryDefinition[] = [
  {
    category: "Networking & Firewall",
    configs: [
      {
        label: "container-networking-method",
        description: "The method of container networking setup",
        input: {
          type: "select",
          options: [
            { label: "local", value: "local" }, // default
            { label: "fan", value: "fan" },
            { label: "provider", value: "provider" },
          ],
        },
      },
      {
        label: "default-space",
        description: "The default network space used for application endpoints",
        input: {
          type: "string",
          placeholder: "default",
        },
      },
      {
        label: "disable-network-management",
        description: "Determines whether the provider should control networks",
        input: { type: "boolean" }, // default: false
      },
      {
        label: "egress-subnets",
        description:
          "The source address(es) for traffic originating from this model",
        input: {
          type: "string",
        },
      },
      {
        label: "fan-config",
        description: "The configuration for fan networking for this model",
        input: { type: "string" },
      },
      {
        label: "firewall-mode",
        description: "The mode to use for network firewalling",
        input: {
          type: "select",
          options: [
            { label: "instance", value: "instance" },
            { label: "global", value: "global" },
            { label: "none", value: "none" },
          ],
        },
      },
      {
        label: "ignore-machine-addresses",
        description:
          "Determines whether the machine worker should discover machine addresses on startup",
        input: {
          type: "boolean", // default: false
        },
      },
      {
        label: "net-bond-reconfigure-delay",
        description:
          "The amount of time in seconds to sleep between ifdown and ifup when bridging",
        input: {
          type: "string",
          placeholder: "17", //default: 17
        },
      },
      {
        label: "saas-ingress-allow",
        description:
          "The CIDR allowlist for SAAS ingress traffic to this model",
        input: {
          type: "string",
          placeholder: "0.0.0.0/0,::/0", // default: 0.0.0.0/0,::/0
        },
      },
    ],
  },
  {
    category: "Provisioning & images",
    configs: [
      {
        label: "automatically-retry-hooks",
        description: "Automatically retry transiently failing hooks.",
        input: { type: "boolean" },
      },
      {
        label: "backup-dir",
        description:
          "Directory where backup files are written by model components.",
        input: { type: "string", placeholder: "/var/lib/juju/backups" },
      },
      {
        label: "image-metadata-url",
        description:
          "Private image metadata endpoint used when resolving base images.",
        input: { type: "string", placeholder: "https://images.example.com" },
      },
      {
        label: "image-stream",
        description: "Image stream policy used for resolving machine images.",
        input: {
          type: "select",
          options: [
            { label: "released", value: "released" },
            { label: "daily", value: "daily" },
          ],
        },
      },
      {
        label: "default-base",
        description:
          "Fallback base used when charms do not pin one explicitly.",
        input: { type: "string", placeholder: "ubuntu@22.04" },
      },
    ],
  },
  {
    category: "Containers",
    configs: [
      {
        label: "container-image-stream",
        description:
          "Container image stream to use for controller-managed workloads.",
        input: {
          type: "select",
          options: [
            { label: "released", value: "released" },
            { label: "daily", value: "daily" },
          ],
        },
      },
      {
        label: "container-networking-method",
        description: "Networking mode used for newly created containers.",
        input: {
          type: "select",
          options: [
            { label: "provider", value: "provider" },
            { label: "local", value: "local" },
          ],
        },
      },
      {
        label: "provisioner-use-default-series",
        description:
          "Prefer model default series when provisioning new machines.",
        input: { type: "boolean" },
      },
      {
        label: "logging-config",
        description:
          "Structured logging configuration for model-managed services.",
        input: {
          type: "string",
          placeholder: "<root>=INFO;juju.apiserver=DEBUG",
        },
      },
      {
        label: "resource-tags",
        description:
          "Provider-specific tags applied to created compute resources.",
        input: { type: "string", placeholder: "env=dev,owner=platform" },
      },
    ],
  },
  {
    category: "Security & operations",
    configs: [
      {
        label: "caas-image-repo",
        description: "Custom OCI image registry prefix for CAAS charms.",
        input: { type: "string", placeholder: "registry.example.com/juju" },
      },
      {
        label: "cloudinit-userdata",
        description:
          "Cloud-init user-data script injected on machine bootstrap.",
        input: { type: "string", placeholder: "#!/bin/bash" },
      },
      {
        label: "enable-os-refresh-update",
        description: "Allow unattended OS package updates managed by Juju.",
        input: { type: "boolean" },
      },
      {
        label: "enable-os-upgrade",
        description: "Allow unattended distro upgrades managed by Juju.",
        input: { type: "boolean" },
      },
      {
        label: "test-mode",
        description:
          "Enable relaxed behaviour intended for non-production testing.",
        input: { type: "boolean" },
      },
    ],
  },
];
