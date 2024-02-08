import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import type {
  ListSecretResult,
  SecretValueResult,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

import type { ControllerInfo } from "juju/jimm/JIMMV3";
import type { AuditEvent } from "juju/jimm/JIMMV3";
import type { CrossModelQueryResponse } from "juju/jimm/JIMMV4";
import type {
  ApplicationInfo,
  FullStatusWithAnnotations,
  ModelWatcherData,
} from "juju/types";
import type { GenericItemsState, GenericState } from "store/types";

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

export type AuditEventsState = Omit<
  GenericItemsState<AuditEvent, void>,
  "errors"
> & {
  limit: number;
};

export type CrossModelQueryState = GenericState<
  CrossModelQueryResponse["errors"] | string
> & {
  results: CrossModelQueryResponse["results"] | null;
};

export type SecretsContent = GenericState<string> & {
  content?: SecretValueResult["data"] | null;
};

export type ModelSecrets = GenericItemsState<ListSecretResult, string> & {
  content?: SecretsContent;
};

export type SecretsState = Record<string, ModelSecrets>;

export type ModelFeatures = {
  listSecrets?: boolean;
  manageSecrets?: boolean;
};

export type ModelFeaturesState = Record<string, ModelFeatures>;

export type JujuState = {
  auditEvents: AuditEventsState;
  crossModelQuery: CrossModelQueryState;
  controllers: Controllers | null;
  models: ModelsList;
  modelsError: string | null;
  modelsLoaded: boolean;
  modelData: ModelDataList;
  modelFeatures: ModelFeaturesState;
  modelWatcherData?: ModelWatcherData;
  charms: Charm[];
  secrets: SecretsState;
  selectedApplications: ApplicationInfo[];
};
