import type { Connection } from "@canonical/jujulib";
import type ActionV7 from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import type { AnnotationsGetResult } from "@canonical/jujulib/dist/api/facades/annotations/AnnotationsV2";
import type AnnotationsV2 from "@canonical/jujulib/dist/api/facades/annotations/AnnotationsV2";
import type ApplicationV18 from "@canonical/jujulib/dist/api/facades/application/ApplicationV18";
import type CharmsV6 from "@canonical/jujulib/dist/api/facades/charms/CharmsV6";
import type ClientV7 from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import type { FullStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import type CloudV7 from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";
import type ControllerV9 from "@canonical/jujulib/dist/api/facades/controller/ControllerV9";
import type ModelManagerV9 from "@canonical/jujulib/dist/api/facades/model-manager/ModelManagerV9";
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
  application?: ApplicationV18;
  charms?: CharmsV6;
  client?: ClientV7;
  cloud?: CloudV7;
  controller?: ControllerV9;
  modelManager?: ModelManagerV9;
  pinger?: PingerV1;
  secrets?: SecretsV2;
  jimM?: InstanceType<typeof JIMMV4>;
};

export type ConnectionWithFacades = {
  facades: Facades;
} & Connection;

export type DestroyModelErrors = [string, string][];
