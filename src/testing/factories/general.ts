import { Factory } from "fishery";

import type { Config, Credential, GeneralState } from "store/general/types";

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
  credentials: null,
  loginError: null,
  pingerIntervalIds: null,
  visitURL: null,
}));
