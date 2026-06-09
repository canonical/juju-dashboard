/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */

import { BOOLEAN_OPTIONS } from "consts";

import type { CategoryDefinition } from "./types";

const EMPTY_OPTION = { label: "Choose an option", value: "" };

export const CONSTRAINT_CATEGORIES: CategoryDefinition[] = [
  {
    category: "Compute",
    fields: [
      {
        label: "cores",
        description: "Number of effective CPU cores (alias: cpu-cores)",
        isNumeric: true,
      },
      {
        label: "cpu-power",
        description: "Abstract CPU power (100 units ≈ 1 Amazon vCPU)",
        isNumeric: true,
      },
      {
        label: "mem",
        description: "Memory in MiB (supports M/G/T/P suffixes)",
      },
      {
        label: "instance-type",
        description: "Cloud-specific instance type name (e.g. m6i.large)",
      },
    ],
  },
  {
    category: "Networking & Placement",
    fields: [
      {
        label: "spaces",
        description:
          "A comma-delimited list of Juju network space names that a unit or machine needs access to",
      },
      {
        label: "zones",
        description:
          "A list of availability zones. Multiple values present a range of zones that a machine must be created within",
      },
      {
        label: "allocate-public-ip",
        description:
          "Supplying this constraint will determine whether machines are issued an IP address accessible outside of the cloud’s virtual network",
        input: {
          type: "select",
          options: [EMPTY_OPTION, ...BOOLEAN_OPTIONS],
        },
      },
    ],
  },
  {
    category: "Platform & Image",
    fields: [
      {
        label: "arch",
        description: "CPU architecture (amd64, arm64, ppc64el, s390x, riscv64)",
        input: {
          type: "select",
          options: [
            EMPTY_OPTION,
            { label: "amd64", value: "amd64" },
            { label: "arm64", value: "arm64" },
            { label: "ppc64el", value: "ppc64el" },
            { label: "s390x", value: "s390x" },
            { label: "riscv64", value: "riscv64" },
          ],
        },
      },
      {
        label: "virt-type",
        description: "Virtualisation type (LXD, OpenStack only)",
      },
      {
        label: "container",
        description:
          "Indicates that a machine must be the specified container type",
        input: {
          type: "select",
          options: [
            EMPTY_OPTION,
            { label: "LXD", value: "lxd" },
            { label: "KVM", value: "kvm" },
          ],
        },
      },
      {
        label: "image-id",
        description: "Indicates that a machine must use the specified image",
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
      },
      {
        label: "root-disk-source",
        description: "Name of storage pool or location the root disk is from",
      },
    ],
  },
  {
    category: "Identity & Tagging",
    fields: [
      {
        label: "instance-role",
        description:
          "Cloud IAM role/profile (AWS instance profiles, Azure managed identities)",
      },
      {
        label: "tags",
        description: "Comma-delimited tags assigned to the machine",
      },
    ],
  },
];
