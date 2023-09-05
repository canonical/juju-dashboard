import { Factory } from "fishery";

import {
  type CrossModelQueryEndpoint,
  type CrossModelQuery,
  type CrossModelQueryApplication,
  type CrossModelQueryApplicationEndpoint,
  type CrossModelQueryMachine,
  type CrossModelQueryModel,
  type CrossModelQueryStatus,
  type CrossModelQueryUnit,
  type CrossModelQueryController,
  type CrossModelQueryOffer,
} from "./jimm-types";

class CrossModelQueryFactory extends Factory<CrossModelQuery> {
  withApplications(count: number = 1) {
    return this.params({
      applications: crossModelQueryApplicationFactory
        .buildList(count)
        .map((app, index) => ({ [`application_${index}`]: app }))
        .reduce((applications, app) => Object.assign(applications, app), {}),
    });
  }
  withApplicationEndpoints(count: number = 1) {
    return this.params({
      "application-endpoints": crossModelQueryApplicationEndpointFactory
        .buildList(count)
        .map((appEndpoint, index) => ({
          [`appEndpoint_${index}`]: appEndpoint,
        }))
        .reduce(
          (appEndpoints, appEndpoint) =>
            Object.assign(appEndpoints, appEndpoint),
          {}
        ),
    });
  }
  withController() {
    return this.params({
      controller: crossModelQueryControllerFactory.build(),
    });
  }
  withMachines(count: number = 1) {
    return this.params({
      machines: crossModelQueryMachineFactory
        .buildList(count)
        .map((machine, index) => ({ [`machine_${index}`]: machine }))
        .reduce((machines, machine) => Object.assign(machines, machine), {}),
    });
  }
  withModel() {
    return this.params({
      model: crossModelQueryModelFactory.build(),
    });
  }
  withOffers(count: number = 1) {
    return this.params({
      offers: crossModelQueryOfferFactory
        .buildList(count)
        .map((offer, index) => ({ [`offer_${index}`]: offer }))
        .reduce((offers, offer) => Object.assign(offers, offer), {}),
    });
  }
}

export const crossModelQueryFactory = CrossModelQueryFactory.define(() => ({}));

export const crossModelQueryApplicationEndpointFactory =
  Factory.define<CrossModelQueryApplicationEndpoint>(() => ({
    "application-status": crossModelQueryStatusFactory.build(),
    endpoints: { mysql: crossModelQueryEndpointFactory.build() },
    relations: { mysql: ["slurmdbd"] },
    url: "jaas-staging:huwshimi@external/cmi-provider.mysql-cmi",
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

export const crossModelQueryOfferFactory = Factory.define<CrossModelQueryOffer>(
  () => ({
    application: "mysql",
    charm: "ch:amd64/jammy/mysql-151",
    endpoints: { mysql: crossModelQueryEndpointFactory.build() },
    "total-connected-count": 1,
  })
);

export const crossModelQueryStatusFactory =
  Factory.define<CrossModelQueryStatus>(() => ({
    current: "pending",
    since: "16 Aug 2023 10:33:46+10:00",
  }));

export const crossModelQueryEndpointFactory =
  Factory.define<CrossModelQueryEndpoint>(() => ({
    interface: "mysql",
    role: "provider",
  }));

export const crossModelQueryControllerFactory =
  Factory.define<CrossModelQueryController>(() => ({
    timestamp: "10:51:03+10:00",
  }));
