import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { ModelInfo } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
import type {
  ListSecretResult,
  SecretValueResult,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

import type { ControllerInfo } from "juju/jimm/JIMMV3";
import type { AuditEvent } from "juju/jimm/JIMMV3";
import type {
  CrossModelQueryResponse,
  RelationshipTuple,
} from "juju/jimm/JIMMV4";
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

export type Controller = ControllerAnnotations &
  (ControllerInfo | LocalController);

export type Controllers = Record<string, Controller[]>;

// There is some model data that we don't want to store from the full status because it changes
// too often causing needless re-renders and is currently irrelevant
// like controllerTimestamp.
export type ModelData = {
  info?: ModelInfo;
  uuid: string;
} & Omit<FullStatusWithAnnotations, "branches" | "controller-timestamp">;

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
  limit: number;
} & GenericItemsState<AuditEvent, null | string>;

export type CrossModelQueryState = {
  results: CrossModelQueryResponse["results"] | null;
} & GenericState<CrossModelQueryResponse["errors"] | string>;

export type SecretsContent = {
  content?: null | SecretValueResult["data"];
} & GenericState<string>;

export type ModelSecrets = {
  content?: SecretsContent;
} & GenericItemsState<ListSecretResult, string>;

export type SecretsState = Record<string, ModelSecrets>;

export type ModelFeatures = {
  listSecrets?: boolean;
  manageSecrets?: boolean;
};

export type ModelFeaturesState = Record<string, ModelFeatures>;

export type ReBACAllowed = {
  tuple: RelationshipTuple;
  allowed?: boolean | null;
} & GenericState<string>;

export type ReBACRelationship = {
  requestId: string;
} & GenericState<string[]>;

export type ReBACState = {
  allowed: ReBACAllowed[];
  relationships: ReBACRelationship[];
};

export type HistoryItem = {
  command: string;
  messages: string[];
};

export type CommandHistory = Record<string, HistoryItem[]>;

export type JujuState = {
  auditEvents: AuditEventsState;
  crossModelQuery: CrossModelQueryState;
  commandHistory: CommandHistory;
  controllers: Controllers | null;
  models: ModelsList;
  modelsError: null | string;
  modelsLoaded: boolean;
  modelData: ModelDataList;
  modelFeatures: ModelFeaturesState;
  modelWatcherData?: ModelWatcherData;
  charms: Charm[];
  rebac: ReBACState;
  secrets: SecretsState;
  selectedApplications: ApplicationInfo[];
};
