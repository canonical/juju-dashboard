/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */

import type {
  FormikFieldProps,
  SelectProps,
} from "@canonical/react-components";

type CategoryDefinition = {
  category: string;
  fields: {
    label: string;
    description: string;
    input: Partial<({ type: "select" } & SelectProps) | FormikFieldProps>;
  }[];
};

export const CONSTRAINTS_CATEGORIES: CategoryDefinition[] = [
  {
    category: "Compute",
    fields: [
      {
        label: "arch",
        description: "CPU architecture (amd64, arm64, ppc64el, s390x, riscv64)",
        input: {
          type: "select",
          options: [
            { label: "amd64", value: "amd64" },
            { label: "arm64", value: "arm64" },
            { label: "ppc64el", value: "ppc64el" },
            { label: "s390x", value: "s390x" },
            { label: "riscv64", value: "riscv64" },
          ],
        },
      },
      {
        label: "cores",
        description: "Number of effective CPU cores (alias: cpu-cores)",
        input: {
          type: "number",
        },
      },
      {
        label: "cpu-power",
        description: "Abstract CPU power (100 units ≈ 1 Amazon vCPU)",
        input: {
          type: "number",
        },
      },
      {
        label: "mem",
        description: "Memory in MiB (supports M/G/T/P suffixes)",
        input: {
          type: "number",
        },
      },
      {
        label: "virt-type",
        description: "Virtualisation type (LXD, OpenStack only)",
        input: { type: "select", options: [] },
      },
      {
        label: "container",
        description: "Container type the machine must be (lxd, kvm)",
        input: {
          type: "select",
          options: [
            { label: "LXD", value: "lxd" },
            { label: "KVM", value: "kvm" },
          ],
        },
      },
    ],
  },
  {
    category: "Storage",
    fields: [
      {
        label: "root-disk",
        description:
          "Disk space on root drive in MiB (supports M/G/T/P suffixes)",
        input: {
          type: "number",
        },
      },
      {
        label: "root-disk-source",
        description: "Name of storage pool or location the root disk is from",
        input: {
          type: "text",
        },
      },
    ],
  },
  {
    category: "Instance & Image",
    fields: [
      {
        label: "instance-type",
        description: "Cloud-specific instance type name (e.g. m6i.large)",
        input: {
          type: "text",
        },
      },
      {
        label: "instance-role",
        description:
          "Cloud IAM role/profile (AWS instance profiles, Azure managed identities)",
        input: {
          type: "text",
        },
      },
    ],
  },
];
