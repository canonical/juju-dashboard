import { ModelWatcherData } from "juju/types";

export type TSFixMe = any;

export type JujuState = {
  models: ModelsList;
  modelData: TSFixMe;
  modelWatcherData: ModelWatcherData;
};

export type Config = {
  controllerAPIEndpoint: string;
  baseAppURL: string;
  identityProviderAvailable: boolean;
  identityProviderURL: string;
  isJuju: boolean;
};

// TSFixMe: This should use the ConnectionInfo type once it has been exported
// from jujulib.
export type ControllerConnections = Record<string, TSFixMe>;

export type PingerIntervalIds = Record<string, number>;

export type GeneralState = {
  config?: Config;
  controllerConnections?: ControllerConnections;
  // TSFixMe: This should use the Credentials type once it has been exported
  // from jujulib.
  credentials?: TSFixMe;
  pingerIntervalIds?: PingerIntervalIds;
  visitURL?: string;
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
