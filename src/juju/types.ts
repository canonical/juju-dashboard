import type { Connection } from "@canonical/jujulib";
import type ActionV7 from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import type { AnnotationsGetResult } from "@canonical/jujulib/dist/api/facades/annotations/AnnotationsV2";
import type AnnotationsV2 from "@canonical/jujulib/dist/api/facades/annotations/AnnotationsV2";
import type ApplicationV22 from "@canonical/jujulib/dist/api/facades/application/ApplicationV22";
import type CharmsV6 from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type ClientV8 from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type CloudV7 from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";
import type ControllerV12 from "@canonical/jujulib/dist/api/facades/controller/ControllerV12";
import type ModelManagerV10 from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV10";
import type {
  ModelInfoResults as ModelManagerV10ModelInfoResults,
  ModelInfo as ModelManagerV10ModelInfo,
  UserModelList as ModelManagerV10UserModelList,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV10";
import type ModelManagerV11 from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";
import type {
  ModelInfoResults as ModelManagerV11ModelInfoResults,
  ModelInfo as ModelManagerV11ModelInfo,
  UserModelList as ModelManagerV11UserModelList,
} from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV11";
import type PingerV1 from "@canonical/jujulib/dist/api/facades/pinger/PingerV1";
import type SecretsV2 from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

import type JIMMV4 from "./jimm/JIMMV4";

export enum Label {
  CONTROLLER_LOGIN_ERROR = "Could not log into controller",
  LOGIN_TIMEOUT_ERROR = "Timed out when connecting to model.",
}

export type FullStatusAnnotations = Record<
  string,
  AnnotationsGetResult["annotations"]
>;

export type FullStatusWithAnnotations = {
  annotations?: FullStatusAnnotations;
} & FullStatus;

export type Facades = {
  action?: ActionV7;
  annotations?: AnnotationsV2;
  application?: ApplicationV22;
  charms?: CharmsV6;
  client?: ClientV8;
  cloud?: CloudV7;
  controller?: ControllerV12;
  modelManager?: ModelManagerV10 | ModelManagerV11;
  pinger?: PingerV1;
  secrets?: SecretsV2;
  jimM?: InstanceType<typeof JIMMV4>;
};

export type ConnectionWithFacades = {
  facades: Facades;
} & Connection;

export type DestroyModelErrors = [string, string][];

export type ModelInfoResults =
  | ModelManagerV10ModelInfoResults
  | ModelManagerV11ModelInfoResults;

export type ModelInfo = ModelManagerV10ModelInfo | ModelManagerV11ModelInfo;

export type UserModelList =
  | ModelManagerV10UserModelList
  | ModelManagerV11UserModelList;
