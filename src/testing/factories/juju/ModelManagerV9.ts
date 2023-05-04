import type {
  Error,
  MachineHardware,
  ModelInfo,
  ModelInfoResult,
  ModelInfoResults,
  ModelMachineInfo,
  ModelSLAInfo,
  ModelUserInfo,
  Number as ModelNumber,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Factory } from "fishery";

export const numberFactory = Factory.define<ModelNumber>(() => ({
  Build: 1,
  Major: 2,
  Minor: 3,
  Patch: 4,
  Tag: "",
}));

export const errorFactory = Factory.define<Error>(() => ({
  code: "1",
  message: "Uh oh",
}));

export const modelInfoFactory = Factory.define<ModelInfo>(() => ({
  "agent-version": numberFactory.build(),
  "cloud-tag": "cloud-aws",
  "controller-uuid": "con123",
  "is-controller": false,
  life: "alive",
  machines: [],
  name: "test-model",
  "owner-tag": "user-eggman@external",
  sla: modelSLAInfoFactory.build(),
  type: "iaas",
  users: [],
  uuid: "abc123",
}));

export const modelInfoResultFactory = Factory.define<ModelInfoResult>(() => ({
  error: errorFactory.build(),
  result: modelInfoFactory.build(),
}));

export const modelInfoResultsFactory = Factory.define<ModelInfoResults>(() => ({
  results: [],
}));

export const modelUserInfoFactory = Factory.define<ModelUserInfo>(() => ({
  user: "user-eggman@external",
  "display-name": "eggman",
  "last-connection": "2019-11-15T18:31:36Z",
  access: "admin",
  "model-tag": "",
}));

export const machineHardwareFactory = Factory.define<MachineHardware>(() => ({
  arch: "amd64",
  mem: 1700,
  "root-disk": 10240,
  cores: 1,
  "cpu-power": 138,
  tags: [],
  "availability-zone": "us-east1-b",
}));

export const modelMachineInfoFactory = Factory.define<ModelMachineInfo>(() => ({
  id: "0",
  hardware: machineHardwareFactory.build(),
  "instance-id": "juju-9cb18d-0",
  status: "started",
}));

export const modelSLAInfoFactory = Factory.define<ModelSLAInfo>(() => ({
  level: "unsupported",
  owner: "",
}));
