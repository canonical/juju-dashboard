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
  identityProviderAvailable: false,
  identityProviderURL: "",
  isJuju: false,
}));

export const credentialFactory = Factory.define<Credential>(() => ({
  user: "user-eggman@external",
  password: "verysecure123",
}));

export const controllerFeaturesFactory = Factory.define<ControllerFeatures>(
  () => ({
    auditLogs: false,
    crossModelQueries: false,
  })
);

export const controllerFeaturesStateFactory =
  Factory.define<ControllerFeaturesState>(() => ({}));

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
  loginErrors: null,
  pingerIntervalIds: null,
  visitURL: null,
}));
