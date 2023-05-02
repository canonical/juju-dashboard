import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV5";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { ModelInfo as JujuModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";

import type { ApplicationInfo, ModelWatcherData } from "juju/types";

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
  version?: string;
  updateAvailable?: boolean;
};

export type AdditionalController = {
  additionalController: true;
};

export type Controllers = Record<string, (Controller | AdditionalController)[]>;

export type ModelInfo =
  | Omit<JujuModelInfo, "agent-version"> & {
      "agent-version": string;
    };

export type ModelData = {
  applications: FullStatus["applications"];
  info?: ModelInfo;
  machines: FullStatus["machines"];
  model: FullStatus["model"];
  offers: FullStatus["offers"];
  relations: FullStatus["relations"] | null;
  "remote-applications": FullStatus["remote-applications"];
  uuid: string;
};

export type ModelDataList = Record<string, ModelData>;

export type ModelListInfo = {
  name: string;
  ownerTag: string;
  type: string;
  uuid: string;
  wsControllerURL: string;
};

export type ModelsList = {
  [uuid: string]: ModelListInfo;
};

export type JujuState = {
  controllers: Controllers | null;
  models: ModelsList;
  modelsLoaded: boolean;
  modelData: ModelDataList;
  modelWatcherData?: ModelWatcherData;
  charms: Charm[];
  selectedApplications: ApplicationInfo[];
};
