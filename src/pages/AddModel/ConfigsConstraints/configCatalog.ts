/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */

import type { SelectProps } from "@canonical/react-components";

export type CategoryDefinition = {
  category: string;
  fields: {
    label: string;
    description: string;
    defaultValue?: string;
    input?: { type: "select" } & SelectProps;
  }[];
};

export const CONFIG_CATEGORIES: CategoryDefinition[] = [
  {
    category: "Networking & Firewall",
    fields: [
      {
        label: "container-networking-method",
        description: "The method of container networking setup",
        defaultValue: "local",
        input: {
          type: "select",
          options: [
            { label: "local", value: "local" },
            { label: "fan", value: "fan" },
            { label: "provider", value: "provider" },
          ],
        },
      },
      {
        label: "default-space",
        description: "The default network space used for application endpoints",
      },
      {
        label: "disable-network-management",
        description: "Determines whether the provider should control networks",
        defaultValue: "false",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
      {
        label: "egress-subnets",
        description:
          "The source address(es) for traffic originating from this model",
      },
      {
        label: "fan-config",
        description: "The configuration for fan networking for this model",
      },
      {
        label: "firewall-mode",
        description: "The mode to use for network firewalling",
        defaultValue: "instance",
        input: {
          type: "select",
          options: [
            { label: "Instance", value: "instance" },
            { label: "Global", value: "global" },
            { label: "None", value: "none" },
          ],
        },
      },
      {
        label: "ignore-machine-addresses",
        description:
          "Determines whether the machine worker should discover machine addresses on startup",
        defaultValue: "false",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
      {
        label: "net-bond-reconfigure-delay",
        description:
          "The amount of time in seconds to sleep between ifdown and ifup when bridging",
        defaultValue: "17",
      },
      {
        label: "saas-ingress-allow",
        description:
          "The CIDR allowlist for SAAS ingress traffic to this model",
        defaultValue: "0.0.0.0/0,::/0",
      },
      {
        label: "ssh-allow",
        description:
          "The CIDR allowlist for SSH access to instances in this model",
        defaultValue: "0.0.0.0/0,::/0",
      },
      {
        label: "ssl-hostname-verification",
        description: "Determines whether SSL hostname verification is enabled",
        defaultValue: "true",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
    ],
  },
  {
    category: "Proxy & Mirror",
    fields: [
      {
        label: "apt-ftp-proxy",
        description: "The APT FTP proxy for the model",
      },
      {
        label: "apt-http-proxy",
        description: "The APT HTTP proxy for the model",
      },
      {
        label: "apt-https-proxy",
        description: "The APT HTTPS proxy for the model",
      },
      {
        label: "apt-mirror",
        description: "The APT mirror for the model",
      },
      {
        label: "apt-no-proxy",
        description:
          "The list of domain addresses not to be proxied for APT (comma-separated)",
      },
      {
        label: "ftp-proxy",
        description:
          "The FTP proxy value to configure on instances, in the FTP_PROXY environment variable",
      },
      {
        label: "http-proxy",
        description:
          "The HTTP proxy value to configure on instances, in the HTTP_PROXY environment variable",
      },
      {
        label: "https-proxy",
        description:
          "The HTTPS proxy value to configure on instances, in the HTTPS_PROXY environment variable",
      },
      {
        label: "juju-ftp-proxy",
        description:
          "The FTP proxy value to pass to charms in the JUJU_CHARM_FTP_PROXY environment variable",
      },
      {
        label: "juju-http-proxy",
        description:
          "The HTTP proxy value to pass to charms in the JUJU_CHARM_HTTP_PROXY environment variable",
      },
      {
        label: "juju-https-proxy",
        description:
          "The HTTPS proxy value to pass to charms in the JUJU_CHARM_HTTPS_PROXY environment variable",
      },
      {
        label: "juju-no-proxy",
        description:
          "The list of domain addresses not to be proxied (comma-separated), may contain CIDRs. Passed to charms in the JUJU_CHARM_NO_PROXY environment variable",
        defaultValue: "127.0.0.1,localhost,::1",
      },
      {
        label: "no-proxy",
        description:
          "The list of domain addresses not to be proxied (comma-separated)",
        defaultValue: "127.0.0.1,localhost,::1",
      },
      {
        label: "proxy-ssh",
        description:
          "Determines whether SSH commands should be proxied through the API server",
        defaultValue: "false",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
      {
        label: "snap-http-proxy",
        description: "The HTTP proxy value for installing snaps",
      },
      {
        label: "snap-https-proxy",
        description: "The snap-centric HTTPS proxy value",
      },
      {
        label: "snap-store-assertions",
        description: "The store assertions for the defined snap store proxy",
      },
      {
        label: "snap-store-proxy",
        description: "The snap store proxy for installing snaps",
      },
      {
        label: "snap-store-proxy-url",
        description: "The URL for the defined snap store proxy",
      },
    ],
  },
  {
    category: "Cloud-specific configurations",
    fields: [
      {
        label: "base-image-path",
        description: "Base path to look for machine disk images",
      },
      {
        label: "vpc-id",
        description: "Use a specific VPC network",
        defaultValue: "false",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
      {
        label: "vpc-id-force",
        description:
          "Force Juju to use the GCE VPC ID specified with vpc-id, when it fails the minimum validation criteria",
        defaultValue: "false",
        input: {
          type: "select",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
    ],
  },
];
