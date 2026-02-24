import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";
import { Factory } from "fishery";

export const modelInfoFactory = Factory.define<ModelInfo>(() => ({
  "agent-version": "1.2.3",
  "cloud-tag": "cloud-aws",
  "controller-uuid": "con123",
  "is-controller": false,
  "secret-backends": [],
  life: "alive",
  machines: [],
  name: "test-model",
  qualifier: "eggman@external",
  type: "iaas",
  users: [],
  uuid: "abc123",
}));
