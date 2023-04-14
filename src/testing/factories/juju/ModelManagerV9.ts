import type {
  MachineHardware,
  ModelMachineInfo,
  ModelSLAInfo,
  ModelUserInfo,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { Factory } from "fishery";

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
