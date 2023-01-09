import { Factory } from "fishery";

import { RootState } from "store/store";

import { jujuStateFactory } from "./juju";
import { uiStateFactory } from "./ui";

export const rootStateFactory = Factory.define<RootState>(() => ({
  general: {
    config: {
      controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      baseAppURL: "/",
      identityProviderAvailable: false,
      identityProviderURL: "",
      isJuju: false,
    },
  },
  juju: jujuStateFactory.build(),
  ui: uiStateFactory.build(),
}));
