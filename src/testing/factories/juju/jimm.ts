import { Factory } from "fishery";

import type {
  CrossModelQuery,
  Machine,
  Model,
  Unit,
} from "./CrossModelQuery.types";

export const crossModelQueryFactory = Factory.define<CrossModelQuery>(() => ({
  "application-endpoints": {
    "mysql-cmi": {
      "application-status": {
        current: "unknown",
        since: "16 Aug 2023 10:47:30+10:00",
      },
      endpoints: { mysql: { interface: "mysql", role: "provider" } },
      relations: { mysql: ["slurmdbd"] },
      url: "jaas-staging:huwshimi@external/cmi-provider.mysql-cmi",
    },
  },
  applications: {
    slurmdbd: {
      "application-status": {
        current: "unknown",
        since: "16 Aug 2023 10:46:06+10:00",
      },
      base: { channel: "20.04", name: "ubuntu" },
      charm: "slurmdbd",
      "charm-channel": "stable",
      "charm-name": "slurmdbd",
      "charm-origin": "charmhub",
      "charm-rev": 18,
      "charm-version": "0.8.5",
      "endpoint-bindings": {
        "": "alpha",
        db: "alpha",
        fluentbit: "alpha",
        "nrpe-external-master": "alpha",
        slurmdbd: "alpha",
        "slurmdbd-peer": "alpha",
      },
      exposed: false,
      relations: { db: ["mysql-cmi"], "slurmdbd-peer": ["slurmdbd"] },
    },
  },
  controller: { timestamp: "10:51:03+10:00" },
  machines: {
    "0": {
      base: { channel: "22.04", name: "ubuntu" },
      constraints: "cores=2 mem=8192M root-disk=16384M",
      containers: {
        "0/lxd/0": {
          base: { channel: "22.04", name: "ubuntu" },
          "instance-id": "pending",
          "juju-status": {
            current: "pending",
            since: "16 Aug 2023 10:33:52+10:00",
          },
          "machine-status": {
            current: "pending",
            since: "16 Aug 2023 10:33:52+10:00",
          },
          "modification-status": {
            current: "idle",
            since: "16 Aug 2023 10:33:52+10:00",
          },
        },
      },
      "dns-name": "44.234.46.248",
      hardware:
        "arch=amd64 cores=2 cpu-power=700 mem=8192M root-disk=16384M availability-zone=us-west-2d",
      "instance-id": "i-0786c85c882bf194e",
      "ip-addresses": ["44.234.46.248", "172.31.60.224"],
      "juju-status": {
        current: "pending",
        since: "16 Aug 2023 10:33:46+10:00",
      },
      "machine-status": {
        current: "running",
        message: "running",
        since: "16 Aug 2023 10:34:09+10:00",
      },
      "modification-status": {
        current: "idle",
        since: "16 Aug 2023 10:33:46+10:00",
      },
    },
  },
  model: {
    cloud: "aws",
    controller: "jaas-staging",
    "model-status": {
      current: "available",
      since: "16 Aug 2023 10:45:46+10:00",
    },
    name: "cmi-consumer",
    region: "us-west-2",
    sla: "unsupported",
    type: "iaas",
    version: "3.2.2.1",
  },
  storage: {},
}));

export const crossModelQueryUnitFactory = Factory.define<Unit>(() => ({
  "juju-status": {
    current: "allocating",
    since: "16 Aug 2023 10:33:53+10:00",
  },
  machine: "0/lxd/0",
  "workload-status": {
    current: "waiting",
    message: "waiting for machine",
    since: "16 Aug 2023 10:33:53+10:00",
  },
}));

export const crossModelQueryMachineFactory = Factory.define<Machine>(() => ({
  base: { channel: "22.04", name: "ubuntu" },
  constraints: "cores=2 mem=8192M root-disk=16384M",
  containers: {
    "0/lxd/0": {
      base: { channel: "22.04", name: "ubuntu" },
      "instance-id": "pending",
      "juju-status": {
        current: "pending",
        since: "16 Aug 2023 10:33:52+10:00",
      },
      "machine-status": {
        current: "pending",
        since: "16 Aug 2023 10:33:52+10:00",
      },
      "modification-status": {
        current: "idle",
        since: "16 Aug 2023 10:33:52+10:00",
      },
    },
  },
  "dns-name": "44.234.46.248",
  hardware:
    "arch=amd64 cores=2 cpu-power=700 mem=8192M root-disk=16384M availability-zone=us-west-2d",
  "instance-id": "i-0786c85c882bf194e",
  "ip-addresses": ["44.234.46.248", "172.31.60.224"],
  "juju-status": {
    current: "pending",
    since: "16 Aug 2023 10:33:46+10:00",
  },
  "machine-status": {
    current: "running",
    message: "running",
    since: "16 Aug 2023 10:34:09+10:00",
  },
  "modification-status": {
    current: "idle",
    since: "16 Aug 2023 10:33:46+10:00",
  },
}));

export const crossModelQueryModelFactory = Factory.define<Model>(() => ({
  cloud: "aws",
  controller: "jaas-staging",
  "model-status": {
    current: "available",
    since: "16 Aug 2023 10:32:17+10:00",
  },
  name: "k8s2",
  region: "us-west-2",
  sla: "unsupported",
  type: "iaas",
  version: "3.2.2.1",
}));
