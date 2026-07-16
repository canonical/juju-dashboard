/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */

import { BOOLEAN_OPTIONS } from "consts";

import type { ConfigFieldEntry } from "./types";
import { InputType, ValueType } from "./types";

export enum ConstraintCategory {
  COMPUTE = "Compute",
  NETWORKING = "Networking & Placement",
  PLATFORM = "Platform & Image",
  STORAGE = "Storage",
  IDENTITY = "Identity & Tagging",
}

const EMPTY_OPTION = { label: "Unset", value: "" };

export const CONSTRAINT_DEFINITIONS: Omit<
  ConfigFieldEntry,
  "arrayIndex" | "value"
>[] = [
  {
    label: "cores",
    description: "Number of effective CPU cores (alias: cpu-cores)",
    valueType: ValueType.NUMBER,
    category: ConstraintCategory.COMPUTE,
  },
  {
    label: "cpu-power",
    description: "Abstract CPU power (100 units ≈ 1 Amazon vCPU)",
    valueType: ValueType.NUMBER,
    category: ConstraintCategory.COMPUTE,
  },
  {
    label: "mem",
    description: "Memory in MiB (supports M/G/T/P suffixes)",
    category: ConstraintCategory.COMPUTE,
  },
  {
    label: "instance-type",
    description: "Cloud-specific instance type name (e.g. m6i.large)",
    category: ConstraintCategory.COMPUTE,
  },
  {
    label: "spaces",
    description:
      "A comma-delimited list of Juju network space names that a unit or machine needs access to",
    category: ConstraintCategory.NETWORKING,
  },
  {
    label: "zones",
    description:
      "A list of availability zones. Multiple values present a range of zones that a machine must be created within",
    category: ConstraintCategory.NETWORKING,
  },
  {
    label: "allocate-public-ip",
    description:
      "Supplying this constraint will determine whether machines are issued an IP address accessible outside of the cloud’s virtual network",
    valueType: ValueType.BOOLEAN,
    input: {
      type: InputType.SELECT,
      options: [EMPTY_OPTION, ...BOOLEAN_OPTIONS],
    },
    category: ConstraintCategory.NETWORKING,
  },
  {
    label: "arch",
    description: "CPU architecture (amd64, arm64, ppc64el, s390x, riscv64)",
    input: {
      type: InputType.SELECT,
      options: [
        EMPTY_OPTION,
        { label: "amd64", value: "amd64" },
        { label: "arm64", value: "arm64" },
        { label: "ppc64el", value: "ppc64el" },
        { label: "s390x", value: "s390x" },
        { label: "riscv64", value: "riscv64" },
      ],
    },
    category: ConstraintCategory.PLATFORM,
  },
  {
    label: "virt-type",
    description: "Virtualisation type (LXD, OpenStack only)",
    category: ConstraintCategory.PLATFORM,
  },
  {
    label: "container",
    description:
      "Indicates that a machine must be the specified container type",
    input: {
      type: InputType.SELECT,
      options: [
        EMPTY_OPTION,
        { label: "LXD", value: "lxd" },
        { label: "KVM", value: "kvm" },
      ],
    },
    category: ConstraintCategory.PLATFORM,
  },
  {
    label: "image-id",
    description: "Indicates that a machine must use the specified image",
    category: ConstraintCategory.PLATFORM,
  },
  {
    label: "root-disk",
    description: "Disk space on root drive in MiB (supports M/G/T/P suffixes)",
    category: ConstraintCategory.STORAGE,
  },
  {
    label: "root-disk-source",
    description: "Name of storage pool or location the root disk is from",
    category: ConstraintCategory.STORAGE,
  },
  {
    label: "instance-role",
    description:
      "Cloud IAM role/profile (AWS instance profiles, Azure managed identities)",
    category: ConstraintCategory.IDENTITY,
  },
  {
    label: "tags",
    description: "Comma-delimited tags assigned to the machine",
    category: ConstraintCategory.IDENTITY,
  },
];
