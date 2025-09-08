import type { AuthUserInfo } from "@canonical/jujulib/dist/api/facades/admin/AdminV3";
import { Factory } from "fishery";

import type {
  Config,
  ControllerFeatures,
  Credential,
  GeneralState,
  ControllerFeaturesState,
} from "store/general/types";

export const configFactory = Factory.define<Config>(() => ({
  controllerAPIEndpoint: "wss://controller.example.com",
  baseAppURL: "/",
  identityProviderURL: "",
  isJuju: false,
  analyticsEnabled: true,
}));

export const credentialFactory = Factory.define<Credential>(() => ({
  user: "user-eggman@external",
  password: "verysecure123",
}));

export const controllerFeaturesFactory = Factory.define<ControllerFeatures>(
  () => ({
    auditLogs: false,
    crossModelQueries: false,
  }),
);

export const controllerFeaturesStateFactory =
  Factory.define<ControllerFeaturesState>(() => ({}));

export const authUserInfoFactory = Factory.define<AuthUserInfo>(() => ({
  "display-name": "eggman",
  identity: "user-eggman@external",
  "controller-access": "",
  "model-access": "",
}));

class GeneralStateFactory extends Factory<GeneralState> {
  withConfig() {
    return this.params({
      config: configFactory.build(),
    });
  }
}

export const generalStateFactory = GeneralStateFactory.define(() => ({
  appVersion: null,
  config: null,
  connectionError: null,
  controllerConnections: null,
  controllerFeatures: null,
  credentials: null,
  login: null,
  pingerIntervalIds: null,
  visitURLs: null,
}));
