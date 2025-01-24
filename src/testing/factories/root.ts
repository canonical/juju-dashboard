import { Factory } from "fishery";

import type { RootState } from "store/store";

import { generalStateFactory } from "./general";
import { jujuStateFactory } from "./juju/juju";

class RootStateFactory extends Factory<RootState> {
  withGeneralConfig() {
    return this.params({
      general: generalStateFactory.withConfig().build(),
    });
  }
}

export const rootStateFactory = RootStateFactory.define(() => ({
  general: generalStateFactory.build(),
  juju: jujuStateFactory.build(),
}));
