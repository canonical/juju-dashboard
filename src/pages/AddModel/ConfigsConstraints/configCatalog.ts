/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */
import { BOOLEAN_OPTIONS } from "consts";

import type { ConfigFieldEntry } from "./types";
import { InputType, ValueType } from "./types";

export enum ConfigCategory {
  CLOUD = "Cloud-specific configurations",
  NETWORKING = "Networking & Firewall",
  PROXY = "Proxy & Mirror",
  PROVISIONING = "Provisioning & Machines",
  LOGGING = "Logging",
  AGENTS = "Agents & Workloads",
  STORAGE = "Storage & Secrets",
  OPERATIONS = "Operations & Miscellaneous",
}

export const CONFIG_DEFINITIONS: Omit<
  ConfigFieldEntry,
  "arrayIndex" | "value"
>[] = [
  {
    label: "base-image-path",
    description: "Base path to look for machine disk images",
    category: ConfigCategory.CLOUD,
  },
  {
    label: "vpc-id",
    description: "Use a specific VPC network",
    category: ConfigCategory.CLOUD,
  },
  {
    label: "vpc-id-force",
    description:
      "Force Juju to use the GCE VPC ID specified with vpc-id, when it fails the minimum validation criteria",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.CLOUD,
  },
  {
    label: "container-networking-method",
    description: "The method of container networking setup",
    defaultValue: "local",
    input: {
      type: InputType.SELECT,
      options: [
        { label: "local", value: "local" },
        { label: "fan", value: "fan" },
        { label: "provider", value: "provider" },
      ],
    },
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "default-space",
    description: "The default network space used for application endpoints",
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "disable-network-management",
    description: "Determines whether the provider should control networks",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "egress-subnets",
    description:
      "The source address(es) for traffic originating from this model",
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "fan-config",
    description: "The configuration for fan networking for this model",
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "firewall-mode",
    description: "The mode to use for network firewalling",
    defaultValue: "instance",
    input: {
      type: InputType.SELECT,
      options: [
        { label: "Instance", value: "instance" },
        { label: "Global", value: "global" },
        { label: "None", value: "none" },
      ],
    },
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "ignore-machine-addresses",
    description:
      "Determines whether the machine worker should discover machine addresses on startup",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "net-bond-reconfigure-delay",
    description:
      "The amount of time in seconds to sleep between ifdown and ifup when bridging",
    defaultValue: 17,
    valueType: ValueType.NUMBER,
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "saas-ingress-allow",
    description: "The CIDR allowlist for SAAS ingress traffic to this model",
    defaultValue: "0.0.0.0/0,::/0",
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "ssh-allow",
    description: "The CIDR allowlist for SSH access to instances in this model",
    defaultValue: "0.0.0.0/0,::/0",
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "ssl-hostname-verification",
    description: "Determines whether SSL hostname verification is enabled",
    defaultValue: true,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.NETWORKING,
  },
  {
    label: "apt-ftp-proxy",
    description: "The APT FTP proxy for the model",
    category: ConfigCategory.PROXY,
  },
  {
    label: "apt-http-proxy",
    description: "The APT HTTP proxy for the model",
    category: ConfigCategory.PROXY,
  },
  {
    label: "apt-https-proxy",
    description: "The APT HTTPS proxy for the model",
    category: ConfigCategory.PROXY,
  },
  {
    label: "apt-mirror",
    description: "The APT mirror for the model",
    category: ConfigCategory.PROXY,
  },
  {
    label: "apt-no-proxy",
    description:
      "The list of domain addresses not to be proxied for APT (comma-separated)",
    category: ConfigCategory.PROXY,
  },
  {
    label: "ftp-proxy",
    description:
      "The FTP proxy value to configure on instances, in the FTP_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "http-proxy",
    description:
      "The HTTP proxy value to configure on instances, in the HTTP_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "https-proxy",
    description:
      "The HTTPS proxy value to configure on instances, in the HTTPS_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "juju-ftp-proxy",
    description:
      "The FTP proxy value to pass to charms in the JUJU_CHARM_FTP_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "juju-http-proxy",
    description:
      "The HTTP proxy value to pass to charms in the JUJU_CHARM_HTTP_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "juju-https-proxy",
    description:
      "The HTTPS proxy value to pass to charms in the JUJU_CHARM_HTTPS_PROXY environment variable",
    category: ConfigCategory.PROXY,
  },
  {
    label: "juju-no-proxy",
    description:
      "The list of domain addresses not to be proxied (comma-separated), may contain CIDRs. Passed to charms in the JUJU_CHARM_NO_PROXY environment variable",
    defaultValue: "127.0.0.1,localhost,::1",
    category: ConfigCategory.PROXY,
  },
  {
    label: "no-proxy",
    description:
      "The list of domain addresses not to be proxied (comma-separated)",
    defaultValue: "127.0.0.1,localhost,::1",
    category: ConfigCategory.PROXY,
  },
  {
    label: "proxy-ssh",
    description:
      "Determines whether SSH commands should be proxied through the API server",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.PROXY,
  },
  {
    label: "snap-http-proxy",
    description: "The HTTP proxy value for installing snaps",
    category: ConfigCategory.PROXY,
  },
  {
    label: "snap-https-proxy",
    description: "The snap-centric HTTPS proxy value",
    category: ConfigCategory.PROXY,
  },
  {
    label: "snap-store-assertions",
    description: "The store assertions for the defined snap store proxy",
    category: ConfigCategory.PROXY,
  },
  {
    label: "snap-store-proxy",
    description: "The snap store proxy for installing snaps",
    category: ConfigCategory.PROXY,
  },
  {
    label: "snap-store-proxy-url",
    description: "The URL for the defined snap store proxy",
    category: ConfigCategory.PROXY,
  },
  {
    label: "cloudinit-userdata",
    description:
      "Cloud-init user-data (in yaml format) to be added to userdata for new machines created in this model",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "container-image-metadata-defaults-disabled",
    description:
      "Determines whether default simplestreams sources are used for image metadata with containers",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "container-image-metadata-url",
    description:
      "The URL at which the metadata used to locate container OS image ids is located",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "container-image-stream",
    description:
      "The simplestreams stream used to identify which image ids to search when starting a container",
    defaultValue: "released",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "container-inherit-properties",
    description:
      "The list of properties to be copied from the host machine to new containers created in this model (comma-separated)",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "default-base",
    description:
      "The default base image to use for deploying charms, will act like --base when deploying charms",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "default-series",
    description:
      "The default OS series to use for deploying charms (deprecated in favour of default-base)",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "enable-os-refresh-update",
    description:
      "Determines whether newly provisioned instances should run their respective OS's update capability",
    defaultValue: true,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "enable-os-upgrade",
    description:
      "Determines whether newly provisioned instances should run their respective OS's upgrade capability",
    defaultValue: true,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "image-metadata-defaults-disabled",
    description:
      "Determines whether default simplestreams sources are used for image metadata",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "image-metadata-url",
    description:
      "The URL at which the metadata used to locate OS image ids is located",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "image-stream",
    description:
      "The simplestreams stream used to identify which image ids to search when starting an instance",
    defaultValue: "released",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "lxd-snap-channel",
    description:
      "The channel to use when installing LXD from a snap (cosmic and later)",
    defaultValue: "5.0/stable",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "num-container-provision-workers",
    description:
      "The number of container provisioning workers to use per machine",
    defaultValue: 4,
    valueType: ValueType.NUMBER,
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "num-provision-workers",
    description: "The number of provisioning workers to use per model",
    defaultValue: 16,
    valueType: ValueType.NUMBER,
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "project",
    description:
      "The name of the cloud project or namespace to use for this model",
    defaultValue: "default",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "provisioner-harvest-mode",
    description:
      "Sets what to do with unknown machines. Valid values: all, none, unknown, destroyed",
    defaultValue: "destroyed",
    input: {
      type: InputType.SELECT,
      options: [
        { label: "all", value: "all" },
        { label: "none", value: "none" },
        { label: "unknown", value: "unknown" },
        { label: "destroyed", value: "destroyed" },
      ],
    },
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "resource-tags",
    description:
      "A space-separated list of key=value pairs used to apply as tags on supported cloud models",
    defaultValue: "{}",
    category: ConfigCategory.PROVISIONING,
  },
  {
    label: "logforward-enabled",
    description: "Determines whether syslog forwarding is enabled",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.LOGGING,
  },
  {
    label: "logging-config",
    description:
      "The configuration string to use when configuring Juju agent logging",
    defaultValue: "<root>=INFO",
    category: ConfigCategory.LOGGING,
  },
  {
    label: "logging-output",
    description: "The logging output destination: database and/or syslog",
    category: ConfigCategory.LOGGING,
  },
  {
    label: "agent-metadata-url",
    description: "The URL of the private stream",
    category: ConfigCategory.AGENTS,
  },
  {
    label: "agent-stream",
    description: "The version of Juju to use for deploy/upgrades",
    defaultValue: "released",
    category: ConfigCategory.AGENTS,
  },
  {
    label: "agent-version",
    description: "The desired Juju agent version to use",
    // This value is the same as the controller version that the model will be on. Leaving it blank by default allows the UI to send any value explicitly set by the user.
    // This is important to avoid the need for constant updates to this list and to support JIMM-cases where we don't know what the default would be ahead of time.
    defaultValue: "",
    category: ConfigCategory.AGENTS,
  },
  {
    label: "automatically-retry-hooks",
    description:
      "Determines whether the uniter should automatically retry failed hooks",
    defaultValue: true,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.AGENTS,
  },
  {
    label: "charmhub-url",
    description: "The url for Charmhub API calls",
    defaultValue: "https://api.charmhub.io",
    category: ConfigCategory.AGENTS,
  },
  {
    label: "transmit-vendor-metrics",
    description:
      "Determines whether metrics declared by charms deployed into this model are sent for anonymized aggregate analytics",
    defaultValue: true,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.AGENTS,
  },
  {
    label: "update-status-hook-interval",
    description:
      "Sets how often to run the charm update-status hook, in human-readable time format (default 5m, range 1-60m)",
    defaultValue: "5m",
    category: ConfigCategory.AGENTS,
  },
  {
    label: "backup-dir",
    description: "The directory used to store the backup working directory",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "secret-backend",
    description:
      "The name of the secret store backend. Valid values: internal, auto, or a backend name",
    defaultValue: "auto",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "storage-default-filesystem-source",
    description: "The default filesystem storage source for the model",
    defaultValue: "lxd",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "max-action-results-age",
    description:
      "The maximum age for action entries before they are pruned, in human-readable time format",
    defaultValue: "336h",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "max-action-results-size",
    description:
      "The maximum size for the action collection, in human-readable memory format",
    defaultValue: "5G",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "max-status-history-age",
    description:
      "The maximum age for status history entries before they are pruned, in human-readable time format",
    defaultValue: "336h",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "max-status-history-size",
    description:
      "The maximum size for the status history collection, in human-readable memory format",
    defaultValue: "5G",
    category: ConfigCategory.STORAGE,
  },
  {
    label: "development",
    description:
      "Determines whether development mode is enabled for this model",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.OPERATIONS,
  },
  {
    label: "disable-telemetry",
    description:
      "Determines whether telemetry collection is disabled for this model",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.OPERATIONS,
  },
  {
    label: "mode",
    description: "The operation mode for model commands",
    defaultValue: "requires-prompts",
    category: ConfigCategory.OPERATIONS,
  },
  {
    label: "test-mode",
    description: "Determines whether test mode is enabled for this model",
    defaultValue: false,
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: BOOLEAN_OPTIONS,
    },
    category: ConfigCategory.OPERATIONS,
  },
];
