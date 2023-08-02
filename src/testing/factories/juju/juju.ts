import type {
  ApplicationStatus,
  Base,
  MachineStatus,
  NetworkInterface,
  UnitStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Factory } from "fishery";

import type {
  AdditionalController,
  AuditEventsState,
  Controller,
  ControllerLocation,
  JujuState,
  ModelData,
  ModelListInfo,
} from "store/juju/types";

import { modelStatusInfoFactory, detailedStatusFactory } from "./ClientV6";
import { modelSLAInfoFactory } from "./ModelManagerV9";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const additionalControllerFactory = Factory.define<AdditionalController>(
  () => ({
    additionalController: true,
  })
);

export const controllerLocationFactory = Factory.define<ControllerLocation>(
  () => ({
    region: "aws",
  })
);

export const controllerFactory = Factory.define<Controller>(() => ({
  path: "admin/jaas",
  uuid: "a030379a-940f-4760-8fcf-3062bfake4e7",
}));

export const modelListInfoFactory = Factory.define<ModelListInfo>(() => ({
  name: "test-model",
  ownerTag: "user-eggman@external",
  type: "iaas",
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
  wsControllerURL: "wss://example.com/api",
}));

export const modelDataUnitFactory = Factory.define<UnitStatus>(() => ({
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

export const modelDataApplicationFactory = Factory.define<ApplicationStatus>(
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
  })
);

export const modelDataMachineNetworkInterfcaceFactory =
  Factory.define<NetworkInterface>(() => ({
    "ip-addresses": [],
    "mac-address": "a2:a2:53:31:db:9a",
    "is-up": true,
  }));

export const modelDataMachineFactory = Factory.define<MachineStatus>(() => ({
  "agent-status": detailedStatusFactory.build(),
  base: baseFactory.build(),
  "instance-status": detailedStatusFactory.build(),
  "dns-name": "35.243.128.238",
  "ip-addresses": [],
  "instance-id": "juju-9cb18d-0",
  series: "bionic",
  id: "0",
  "network-interfaces": {},
  containers: {},
  constraints: "",
  "display-name": "0",
  hardware:
    "arch=amd64 cores=1 cpu-power=138 mem=1700M root-disk=10240M availability-zone=us-east1-b",
  jobs: [],
  "has-vote": false,
  "modification-status": detailedStatusFactory.build(),
  "wants-vote": false,
  "lxd-profiles": {},
}));

export const modelDataInfoFactory = Factory.define<ModelInfo>(() => ({
  name: "sub-test",
  type: "iaas",
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
  "controller-uuid": "a030379a-940f-4760-8fcf-3062bfake4e7",
  "provider-type": "gce",
  "default-series": "bionic",
  "cloud-tag": "cloud-google",
  "cloud-region": "us-east1",
  "cloud-credential-tag": "cloudcred-google_eggman@external_juju",
  "owner-tag": "user-eggman@external",
  life: "alive",
  "is-controller": false,
  "secret-backends": [],
  sla: modelSLAInfoFactory.build(),
  status: detailedStatusFactory.build(),
  users: [],
  machines: [],
  "agent-version": "2.6.10",
}));

export const modelDataFactory = Factory.define<ModelData>(() => ({
  applications: {},
  machines: {},
  model: modelStatusInfoFactory.build(),
  offers: {},
  relations: [],
  uuid: generateUUID(),
  info: modelDataInfoFactory.build(),
  "remote-applications": {},
}));

export const auditEventsStateFactory = Factory.define<AuditEventsState>(() => ({
  items: null,
  loaded: false,
  loading: false,
}));

export const jujuStateFactory = Factory.define<JujuState>(() => ({
  auditEvents: auditEventsStateFactory.build(),
  controllers: null,
  models: {},
  modelsLoaded: false,
  modelData: {},
  modelWatcherData: {},
  charms: [],
  selectedApplications: [],
}));
