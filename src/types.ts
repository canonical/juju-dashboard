import { ModelWatcherData } from "juju/types";

export type TSFixMe = any;

export type UIState = {
  confirmationModalActive: boolean;
  userMenuActive: boolean;
  sideNavCollapsed: boolean;
};

export type JujuState = {
  models: ModelsList;
  modelData: TSFixMe;
  modelWatcherData: ModelWatcherData;
};

export type ReduxState = {
  root: TSFixMe;
  juju: JujuState;
  ui: UIState;
};

export type ModelsList = {
  [uuid: string]: ModelListInfo;
};

export type ModelListInfo = {
  name: string;
  ownerTag: string;
  type: string;
  uuid: string;
};
