import { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import { ModelWatcherData } from "juju/types";
import { Config } from "store/general/types";

export type TSFixMe = any;

declare global {
  interface Window {
    jujuDashboardConfig?: Config;
  }
}

export type Controller = {
  additionalController?: boolean;
  path: string;
  Public?: boolean;
  uuid: string;
  version: string;
};

export type Controllers = Record<string, Controller>;

export type ModelData = {
  applications: FullStatus["applications"];
  info: ModelInfo;
  machines: FullStatus["machines"];
  model: FullStatus["model"];
  offers: FullStatus["offers"];
  relations: FullStatus["relations"] | null;
  "remote-applications": FullStatus["remote-applications"];
  uuid: string;
};

export type JujuState = {
  controllers: Controllers | null;
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
