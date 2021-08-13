import { ModelWatcherData } from "juju/types";

export type TSFixMe = any;

export type UIState = {
  confirmationModalActive: boolean;
  userMenuActive: boolean;
  sideNavCollapsed: boolean;
};

export type JujuState = {
  models: TSFixMe;
  modelData: TSFixMe;
  modelWatcherData: ModelWatcherData;
};

export type ReduxState = {
  root: TSFixMe;
  juju: JujuState;
  ui: UIState;
};
