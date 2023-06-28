import type { ModelSLAInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Factory } from "fishery";

import type {
  ActionChangeDelta,
  AnnotationChangeDelta,
  ApplicationChangeDelta,
  ApplicationInfo,
  CharmChangeDelta,
  Endpoint,
  EndpointRelation,
  HardwareCharacteristics,
  MachineAgentStatus,
  MachineChangeDelta,
  ModelAgentStatus,
  ModelData as ModelWatcherModelData,
  ModelInfo as ModelWatcherModelInfo,
  RelationChangeDelta,
  UnitAgentStatus,
  UnitChangeDelta,
  WorkloadStatus,
} from "juju/types";

export const workloadStatusFactory = Factory.define<WorkloadStatus>(() => ({
  current: "blocked",
  message: "Insufficient peer units to bootstrap cluster (require 3)",
  version: "",
}));

export const modelAgentStatusFactory = Factory.define<ModelAgentStatus>(() => ({
  current: "available",
  message: "",
  since: "2021-07-28T22:05:36.877177235Z",
  version: "",
}));

export const modelSLAFactory = Factory.define<ModelSLAInfo>(() => ({
  level: "unsupported",
  owner: "",
}));

export const modelWatcherModelInfoFactory =
  Factory.define<ModelWatcherModelInfo>(() => ({
    "cloud-tag": "cloud-aws",
    region: "us-east-1",
    type: "iaas",
    version: "2.9.12",
    "model-uuid": "",
    name: "enterprise",
    life: "alive",
    owner: "kirk@external",
    "controller-uuid": "",
    "is-controller": false,
    config: {},
    status: modelAgentStatusFactory.build(),
    constraints: {},
    sla: modelSLAFactory.build(),
  }));

export const actionChangeDeltaFactory = Factory.define<ActionChangeDelta>(
  () => ({
    "model-uuid": "abc123",
    id: "0",
    receiver: "ceph-mon/0",
    name: "get-health",
    status: "failed",
    message: "Getting health failed, health unknown",
    parameters: { foo: "bar" }, // XXX Fix me
    enqueued: "2021-05-31T22:57:26Z",
    started: "2021-05-31T22:57:29Z",
    completed: "2021-05-31T22:57:30Z",
  })
);

export const applicationInfoFactory = Factory.define<ApplicationInfo>(() => ({
  "charm-url": "cs:ceph-mon-55",
  constraints: {},
  exposed: false,
  life: "alive",
  "min-units": 0,
  "model-uuid": "abc123",
  name: "ceph-mon",
  "owner-tag": "",
  status: workloadStatusFactory.build(),
  subordinate: false,
  "unit-count": 1,
  "workload-version": "12.2.13",
}));

export const charmChangeDeltaFactory = Factory.define<CharmChangeDelta>(() => ({
  "charm-url": "",
  "charm-version": "",
  life: "alive",
  "model-uuid": "abc123",
  profile: null,
}));

export const machineAgentStatusFactory = Factory.define<MachineAgentStatus>(
  () => ({
    current: "started",
    message: "",
    since: "2021-08-13T19:32:59.800842177Z",
    version: "2.8.7",
  })
);

export const hardwareCharacteristicsFactory =
  Factory.define<HardwareCharacteristics>(() => ({
    arch: "amd64",
    "availability-zone": "us-east-1a",
    "cpu-cores": 2,
    "cpu-power": 700,
    mem: 8192,
    "root-disk": 8192,
  }));

export const machineChangeDeltaFactory = Factory.define<MachineChangeDelta>(
  () => ({
    addresses: null,
    "agent-status": machineAgentStatusFactory.build(),
    "container-type": "",
    "hardware-characteristics": hardwareCharacteristicsFactory.build(),
    "has-vote": false,
    id: "0",
    "instance-id": "i-0a195974d9fdd9d16",
    "instance-status": machineAgentStatusFactory.build(),
    jobs: ["JobHostUnits"],
    life: "alive",
    "model-uuid": "abc123",
    series: "bionic",
    "supported-containers": null,
    "supported-containers-known": true,
    "wants-vote": false,
  })
);

export const endpointRelationFactory = Factory.define<EndpointRelation>(() => ({
  interface: "mysql",
  limit: 0,
  name: "db",
  optional: false,
  role: "requirer",
  scope: "global",
}));

export const endpointFactory = Factory.define<Endpoint>(() => ({
  "application-name": "wordpress",
  relation: endpointRelationFactory.build(),
}));

export const relationChangeDeltaFactory = Factory.define<RelationChangeDelta>(
  () => ({
    "model-uuid": "abc123",
    key: "wordpress:db mysql:db",
    id: 0,
    interface: "mysql",
    endpoints: [
      {
        "application-name": "wordpress",
        relation: {
          interface: "mysql",
          limit: 0,
          name: "db",
          optional: false,
          role: "requirer",
          scope: "global",
        },
      },
      {
        "application-name": "mysql",
        relation: {
          interface: "mysql",
          limit: 0,
          name: "db",
          optional: false,
          role: "provider",
          scope: "global",
        },
      },
    ],
  })
);

export const unitAgentStatusFactory = Factory.define<UnitAgentStatus>(() => ({
  current: "idle",
  message: "",
  version: "2.8.7",
}));

export const unitChangeDeltaFactory = Factory.define<UnitChangeDelta>(() => ({
  "agent-status": unitAgentStatusFactory.build(),
  "charm-url": "cs:ceph-mon-55",
  "machine-id": "0",
  "model-uuid": "abc123",
  "port-ranges": null,
  "private-address": "172.31.43.84",
  "public-address": "54.162.156.160",
  "workload-status": workloadStatusFactory.build(),
  application: "ceph-mon",
  life: "alive",
  machine: "5",
  name: "ceph-mon/0",
  ports: null,
  principal: "",
  series: "bionic",
  subordinate: false,
}));

export const annotationChangeDeltaFactory =
  Factory.define<AnnotationChangeDelta>(() => ({
    "model-uuid": "abc123",
    tag: "application-etcd",
    annotations: {},
  }));

export const applicationChangeDeltaFactory =
  Factory.define<ApplicationChangeDelta>(() => ({
    "charm-url": "ch:amd64/focal/postgresql-k8s-20",
    constraints: {},
    exposed: false,
    life: "alive",
    "min-units": 0,
    "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
    name: "db2",
    "owner-tag": "user-eggman",
    subordinate: false,
    "workload-version": "",
  }));

export const modelWatcherModelDataFactory =
  Factory.define<ModelWatcherModelData>(() => ({
    "remote-applications": {},
    actions: {},
    annotations: {},
    applications: {},
    charms: {},
    machines: {},
    model: modelWatcherModelInfoFactory.build(),
    offers: {},
    relations: {},
    units: {},
  }));
