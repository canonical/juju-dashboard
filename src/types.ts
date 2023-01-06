import { ModelWatcherData } from "juju/types";

export type TSFixMe = any;

export type JujuState = {
  models: ModelsList;
  modelData: TSFixMe;
  modelWatcherData: ModelWatcherData;
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
