import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";

import type { AuditEvent } from "juju/jimm/JIMMV4";
import type {
  ApplicationInfo,
  FullStatusWithAnnotations,
  ModelWatcherData,
} from "juju/types";

export type ControllerLocation = {
  cloud?: string;
  region: string;
};

export type Controller = {
  additionalController?: boolean;
  location?: ControllerLocation;
  name?: string;
  path: string;
  Public?: boolean;
  uuid: string;
  version?: string;
  updateAvailable?: boolean | null;
};

export type AdditionalController = {
  additionalController: true;
};

export type Controllers = Record<string, (Controller | AdditionalController)[]>;

// There is some model data that we don't want to store from the full status because it changes
// too often causing needless re-renders and is currently irrelevant
// like controllerTimestamp.
export type ModelData = Omit<
  FullStatusWithAnnotations,
  "branches" | "controller-timestamp"
> & {
  info?: ModelInfo;
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

export type AuditEventsState = {
  items: AuditEvent[] | null;
  loaded: boolean;
  loading: boolean;
  limit: number;
};

export type JujuState = {
  auditEvents: AuditEventsState;
  controllers: Controllers | null;
  models: ModelsList;
  modelsLoaded: boolean;
  modelData: ModelDataList;
  modelWatcherData?: ModelWatcherData;
  charms: Charm[];
  selectedApplications: ApplicationInfo[];
};
