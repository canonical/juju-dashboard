import { ModelWatcherData } from "juju/types";
import { TSFixMe } from "types";

export type ControllerLocation = {
  cloud?: string;
  region: string;
};

export type Controller = {
  additionalController?: boolean;
  location?: ControllerLocation;
  path: string;
  Public?: boolean;
  uuid: string;
  version: string;
};

export type Controllers = Record<string, Controller[]>;

export type ModelsList = {
  [uuid: string]: ModelListInfo;
};

export type ModelListInfo = {
  name: string;
  ownerTag: string;
  type: string;
  uuid: string;
};

export type JujuState = {
  controllers: Controllers | null;
  models: ModelsList;
  modelData: TSFixMe;
  modelWatcherData?: ModelWatcherData;
};
