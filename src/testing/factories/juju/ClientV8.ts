import type {
  DetailedStatus,
  RelationStatus,
  MachineStatus,
  ModelStatusInfo,
  FullStatus,
  ApplicationOfferStatus,
  RemoteApplicationStatus,
  Base,
  ApplicationStatus,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import { Factory } from "fishery";

export const detailedStatusFactory = Factory.define<DetailedStatus>(() => ({
  data: {},
  info: "ready",
  kind: "",
  life: "",
  since: "2023-02-26T23:40:27.575528717Z",
  status: "active",
  version: "",
}));

export const relationStatusFactory = Factory.define<RelationStatus>(() => ({
  endpoints: [
    {
      application: "wordpress",
      name: "db",
      subordinate: false,
      role: "requirer",
    },
    {
      application: "mysql",
      name: "db",
      subordinate: false,
      role: "provider",
    },
  ],
  key: "wordpress:db mysql:db",
  id: 0,
  interface: "mysql",
  scope: "global",
  status: detailedStatusFactory.build(),
}));

export const unitStatusFactory = Factory.define<UnitStatus>(() => ({
  "agent-status": detailedStatusFactory.build(),
  "workload-status": detailedStatusFactory.build(),
  "workload-version": "3.0.1",
  machine: "1",
  "opened-ports": [],
  "public-address": "35.229.83.62",
  charm: "",
  subordinates: {},
  leader: true,
}));

export const baseFactory = Factory.define<Base>(() => ({
  channel: "stable",
  name: "Stable",
}));

export const applicationStatusFactory = Factory.define<ApplicationStatus>(
  () => ({
    base: baseFactory.build(),
    charm: "cs:~containers/easyrsa-278",
    "charm-profile": "",
    series: "bionic",
    exposed: false,
    life: "",
    relations: {},
    "can-upgrade-to": "",
    "subordinate-to": [],
    units: {},
    "meter-statuses": {},
    status: detailedStatusFactory.build(),
    "workload-version": "3.0.1",
    "charm-version": "7af705f",
    "endpoint-bindings": {},
    "public-address": "",
  }),
);

export const machineStatusFactory = Factory.define<MachineStatus>(() => ({
  "agent-status": detailedStatusFactory.build(),
  "instance-status": detailedStatusFactory.build(),
  "modification-status": detailedStatusFactory.build(),
  "dns-name": "1.2.3.4",
  "instance-id": "juju-123-0",
  "display-name": "",
  base: baseFactory.build(),
  id: "0",
  containers: {},
  constraints: "arch=amd64",
  hardware:
    "arch=amd64 cores=0 mem=0M availability-zone=danger virt-type=container",
  jobs: [],
  "has-vote": false,
  "wants-vote": false,
}));

export const modelStatusInfoFactory = Factory.define<ModelStatusInfo>(() => ({
  name: "sub-test",
  type: "iaas",
  "cloud-tag": "cloud-google",
  region: "us-east1",
  version: "2.6.10",
  "available-version": "",
  "model-status": detailedStatusFactory.build(),
  "meter-status": {
    color: "",
    message: "",
  },
  sla: "unsupported",
}));

export const fullStatusFactory = Factory.define<FullStatus>(() => ({
  "controller-timestamp": "1999-11-15T18:31:36Z",
  "remote-applications": {},
  actions: {},
  annotations: {},
  applications: {},
  branches: {},
  charms: {},
  machines: {},
  model: modelStatusInfoFactory.build(),
  offers: {},
  relations: [],
  units: {},
}));

export const applicationOfferStatusFactory =
  Factory.define<ApplicationOfferStatus>(() => ({
    "active-connected-count": 1,
    "application-name": "etcd",
    charm: "ch:etcd",
    endpoints: {},
    "offer-name": "db",
    "total-connected-count": 2,
  }));

export const remoteApplicationStatusFactory =
  Factory.define<RemoteApplicationStatus>(() => ({
    endpoints: [],
    life: "",
    "offer-name": "mysql",
    "offer-url": "juju-controller:admin/cmr.mysql",
    relations: {},
    status: detailedStatusFactory.build(),
  }));
