import { Factory } from "fishery";

import type { UIState } from "store/ui/types";

export const uiStateFactory = Factory.define<UIState>(() => ({
  userMenuActive: false,
  confirmationModalActive: false,
  sideNavCollapsed: false,
}));
