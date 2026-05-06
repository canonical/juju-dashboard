import type { Charm } from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type { CloudsResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";
import type { ErrorResult } from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV10";
import type {
  ListSecretResult,
  SecretValueResult,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

import type { Source } from "data";
import type { ControllerInfo } from "juju/jimm/JIMMV3";
import type { AuditEvent } from "juju/jimm/JIMMV3";
import type {
  CrossModelQueryResponse,
  RelationshipTuple,
  VersionElem,
} from "juju/jimm/JIMMV4";
import type { FullStatusWithAnnotations, ModelInfo } from "juju/types";
import type { DisableType } from "pages/AddModel/ConfigsConstraints/types";
import type { ProcessOutcome } from "store/middleware/process";
import type { GenericItemsState, GenericState } from "store/types";
import type { AccessLevel } from "types";

/**
 * Data derived from a `Source`.
 */
export type SourceData<T> = Pick<Source<T>, "data" | "error" | "loading">;

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
  qualifier: string;
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

export type DestroyModelState = {
  modelName: string;
} & GenericState<ErrorResult["error"] | string>;

export type DestroyState = Record<string, DestroyModelState>;

export type SecretsContent = {
  content?: null | SecretValueResult["data"];
} & GenericState<string>;

export type ModelSecrets = {
  content?: SecretsContent;
} & GenericItemsState<ListSecretResult, string>;

export type SecretsState = Record<string, ModelSecrets>;

export type CloudState = {
  errors: null | string | unknown;
  loading: boolean;
  clouds: CloudsResult["clouds"] | null;
};

export type UserCredentialsState = {
  credentials: Record<string, string[]>;
  errors: null | string | unknown;
  loading: boolean;
};

export type ModelFeatures = {
  listSecrets?: boolean;
  manageSecrets?: boolean;
};

export type ModelFeaturesState = Record<string, ModelFeatures>;

export type ModelUpgrade = {
  currentVersion: string;
  upgradeVersion: string;
};

export type ModelUpgradeState = Record<string, ModelUpgrade>;

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

export type SupportedJujuVersionsState = SourceData<VersionElem[]>;

export type ModelMigrationTargetsState = Record<string, SourceData<string[]>>;

export type AddModel = {
  modelName: string;
  credential: string;
  cloudTag: string;
  userTag: string;
  shareModelWith?: Record<string, AccessLevel>;
  disabledCommands: DisableType;
  region?: string;
  config?: Record<string, string>;
};

export type AddModelState = {
  loading: boolean;
  loaded: boolean;
  errors?: string | unknown;
  success?: boolean;
};

export type BlockEntry = {
  running: boolean;
  status: "initiated" | "pending" | null;
  outcome: null | ProcessOutcome<void>;
};

export type BlockState = Record<string, BlockEntry>;

export type JujuState = {
  auditEvents: AuditEventsState;
  crossModelQuery: CrossModelQueryState;
  destroyModel: DestroyState;
  commandHistory: CommandHistory;
  controllers: Controllers | null;
  models: ModelsList;
  modelsError: null | string;
  modelsLoaded: boolean;
  modelListLoading: Record<string, boolean>;
  modelData: ModelDataList;
  modelFeatures: ModelFeaturesState;
  modelUpgrade: ModelUpgradeState;
  modelMigrationTargets: ModelMigrationTargetsState;
  charms: Charm[];
  rebac: ReBACState;
  secrets: SecretsState;
  cloudInfo: CloudState;
  userCredentials: UserCredentialsState;
  selectedApplications: Record<string, ApplicationStatus>;
  supportedJujuVersions: SupportedJujuVersionsState;
  addModelState: AddModelState;
  blockState: BlockState;
};
