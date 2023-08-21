import { Factory } from "fishery";

import type {
  CrossModelQuery,
  CrossModelQueryApplication,
  CrossModelQueryApplicationEndpoint,
  CrossModelQueryMachine,
  CrossModelQueryModel,
  CrossModelQueryStatus,
  CrossModelQueryUnit,
} from "./jimm-types";

export const crossModelQueryFactory = Factory.define<CrossModelQuery>(
  () => ({})
);

export const crossModelQueryApplicationEndpointFactory =
  Factory.define<CrossModelQueryApplicationEndpoint>(() => ({
    "mysql-cmi": {
      "application-status": crossModelQueryStatusFactory.build(),
      endpoints: { mysql: { interface: "mysql", role: "provider" } },
      relations: { mysql: ["slurmdbd"] },
      url: "jaas-staging:huwshimi@external/cmi-provider.mysql-cmi",
    },
  }));

export const crossModelQueryApplicationFactory =
  Factory.define<CrossModelQueryApplication>(() => ({
    "application-status": crossModelQueryStatusFactory.build(),
    base: { channel: "22.04", name: "ubuntu" },
    charm: "calico",
    "charm-channel": "stable",
    "charm-name": "calico",
    "charm-origin": "charmhub",
    "charm-rev": 87,
    "charm-version": "a164af4",
    "endpoint-bindings": { "": "alpha", cni: "alpha", etcd: "alpha" },
    exposed: false,
    relations: {
      cni: ["kubernetes-control-plane", "kubernetes-worker"],
      etcd: ["etcd"],
    },
    "subordinate-to": ["kubernetes-control-plane", "kubernetes-worker"],
  }));

export const crossModelQueryUnitFactory = Factory.define<CrossModelQueryUnit>(
  () => ({
    "juju-status": crossModelQueryStatusFactory.build(),
    machine: "0/lxd/0",
    "workload-status": crossModelQueryStatusFactory.build(),
  })
);

export const crossModelQueryMachineFactory =
  Factory.define<CrossModelQueryMachine>(() => ({
    base: { channel: "22.04", name: "ubuntu" },
    constraints: "cores=2 mem=8192M root-disk=16384M",
    "dns-name": "44.234.46.248",
    hardware:
      "arch=amd64 cores=2 cpu-power=700 mem=8192M root-disk=16384M availability-zone=us-west-2d",
    "instance-id": "i-0786c85c882bf194e",
    "ip-addresses": ["44.234.46.248", "172.31.60.224"],
    "juju-status": crossModelQueryStatusFactory.build(),
    "machine-status": crossModelQueryStatusFactory.build(),
    "modification-status": crossModelQueryStatusFactory.build(),
  }));

export const crossModelQueryModelFactory = Factory.define<CrossModelQueryModel>(
  () => ({
    cloud: "aws",
    controller: "jaas-staging",
    "model-status": crossModelQueryStatusFactory.build(),
    name: "k8s2",
    region: "us-west-2",
    sla: "unsupported",
    type: "iaas",
    version: "3.2.2.1",
  })
);

export const crossModelQueryStatusFactory =
  Factory.define<CrossModelQueryStatus>(() => ({
    current: "pending",
    since: "16 Aug 2023 10:33:46+10:00",
  }));
