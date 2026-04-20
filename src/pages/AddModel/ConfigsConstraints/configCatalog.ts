/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */

import type {
  FormikFieldProps,
  SelectProps,
} from "@canonical/react-components";

export type CategoryDefinition = {
  category: string;
  fields: {
    label: string;
    description: string;
    input: Partial<({ type: "select" } & SelectProps) | FormikFieldProps>;
  }[];
};

export const CONFIG_CATEGORIES: CategoryDefinition[] = [
  {
    category: "Networking & Firewall",
    fields: [
      {
        label: "container-networking-method",
        description: "The method of container networking setup",
        input: {
          type: "select",
          defaultValue: "local",
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
        input: {
          type: "text",
        },
      },
      {
        label: "disable-network-management",
        description: "Determines whether the provider should control networks",
        input: {
          type: "select",
          defaultValue: "false",
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
        input: {
          type: "text",
        },
      },
      {
        label: "fan-config",
        description: "The configuration for fan networking for this model",
        input: { type: "text" },
      },
      {
        label: "firewall-mode",
        description: "The mode to use for network firewalling",
        input: {
          type: "select",
          defaultValue: "instance",
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
        input: {
          type: "select",
          defaultValue: "false",
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
        input: {
          type: "number",
          defaultValue: 17,
          placeholder: "17",
        },
      },
      {
        label: "saas-ingress-allow",
        description:
          "The CIDR allowlist for SAAS ingress traffic to this model",
        input: {
          type: "text",
          defaultValue: "0.0.0.0/0,::/0",
          placeholder: "0.0.0.0/0,::/0",
        },
      },
      {
        label: "ssh-allow",
        description:
          "The CIDR allowlist for SSH access to instances in this model",
        input: {
          type: "text",
          defaultValue: "0.0.0.0/0,::/0",
          placeholder: "0.0.0.0/0,::/0",
        },
      },
      {
        label: "ssl-hostname-verification",
        description: "Determines whether SSL hostname verification is enabled",
        input: {
          type: "select",
          defaultValue: "true",
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
        input: {
          type: "text",
        },
      },
      {
        label: "apt-http-proxy",
        description: "The APT HTTP proxy for the model",
        input: {
          type: "text",
        },
      },
      {
        label: "apt-https-proxy",
        description: "The APT HTTPS proxy for the model",
        input: {
          type: "text",
        },
      },
      {
        label: "apt-mirror",
        description: "The APT mirror for the model",
        input: { type: "text" },
      },
      {
        label: "apt-no-proxy",
        description:
          "The list of domain addresses not to be proxied for APT (comma-separated)",
        input: { type: "text" },
      },
      {
        label: "ftp-proxy",
        description:
          "The FTP proxy value to configure on instances, in the FTP_PROXY environment variable",
        input: {
          type: "text",
        },
      },
      {
        label: "http-proxy",
        description:
          "The HTTP proxy value to configure on instances, in the HTTP_PROXY environment variable",
        input: {
          type: "text",
        },
      },
      {
        label: "https-proxy",
        description:
          "The HTTPS proxy value to configure on instances, in the HTTPS_PROXY environment variable",
        input: {
          type: "text",
        },
      },
      {
        label: "juju-ftp-proxy",
        description:
          "The FTP proxy value to pass to charms in the JUJU_CHARM_FTP_PROXY environment variable",
        input: { type: "text" },
      },
      {
        label: "juju-http-proxy",
        description:
          "The HTTP proxy value to pass to charms in the JUJU_CHARM_HTTP_PROXY environment variable",
        input: { type: "text" },
      },
      {
        label: "juju-https-proxy",
        description:
          "The HTTPS proxy value to pass to charms in the JUJU_CHARM_HTTPS_PROXY environment variable",
        input: { type: "text" },
      },
      {
        label: "juju-no-proxy",
        description:
          "The list of domain addresses not to be proxied (comma-separated), may contain CIDRs. Passed to charms in the JUJU_CHARM_NO_PROXY environment variable",
        input: {
          type: "text",
          defaultValue: "127.0.0.1,localhost,::1",
          placeholder: "127.0.0.1,localhost,::1",
        },
      },
      {
        label: "no-proxy",
        description:
          "The list of domain addresses not to be proxied (comma-separated)",
        input: {
          type: "text",
          defaultValue: "127.0.0.1,localhost,::1",
          placeholder: "127.0.0.1,localhost,::1",
        },
      },
      {
        label: "proxy-ssh",
        description:
          "Determines whether SSH commands should be proxied through the API server",
        input: {
          type: "select",
          defaultValue: "false",
          options: [
            { label: "True", value: "true" },
            { label: "False", value: "false" },
          ],
        },
      },
      {
        label: "snap-http-proxy",
        description: "The HTTP proxy value for installing snaps",
        input: { type: "text" },
      },
      {
        label: "snap-https-proxy",
        description: "The snap-centric HTTPS proxy value",
        input: { type: "text" },
      },
      {
        label: "snap-store-assertions",
        description: "The store assertions for the defined snap store proxy",
        input: { type: "text" },
      },
      {
        label: "snap-store-proxy",
        description: "The snap store proxy for installing snaps",
        input: { type: "text" },
      },
      {
        label: "snap-store-proxy-url",
        description: "The URL for the defined snap store proxy",
        input: { type: "text" },
      },
    ],
  },
];
