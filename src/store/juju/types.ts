import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";

import type { ControllerInfo } from "juju/jimm/JIMMV3";
import type { AuditEvent } from "juju/jimm/JIMMV3";
import type { CrossModelQueryResponse } from "juju/jimm/JIMMV4";
import type {
  ApplicationInfo,
  FullStatusWithAnnotations,
  ModelWatcherData,
} from "juju/types";

export type ControllerLocation = {
  cloud?: string;
  region: string;
};

export type ControllerAnnotations = {
  location?: ControllerLocation;
  updateAvailable?: boolean;
};

export type LocalController = {
  name?: string;
  path: string;
  uuid: string;
  version?: string;
};

export type Controller = (ControllerInfo | LocalController) &
  ControllerAnnotations;

export type Controllers = Record<string, Controller[]>;

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

export type CrossModelQueryState = {
  results: CrossModelQueryResponse["results"] | null;
  errors: CrossModelQueryResponse["errors"] | string | null;
  loaded: boolean;
  loading: boolean;
};

export type JujuState = {
  auditEvents: AuditEventsState;
  crossModelQuery: CrossModelQueryState;
  controllers: Controllers | null;
  models: ModelsList;
  modelsError: string | null;
  modelsLoaded: boolean;
  modelData: ModelDataList;
  modelWatcherData?: ModelWatcherData;
  charms: Charm[];
  selectedApplications: ApplicationInfo[];
};
