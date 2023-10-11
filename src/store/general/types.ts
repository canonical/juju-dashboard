import type { ConnectionInfo } from "@canonical/jujulib";

export type Config = {
  controllerAPIEndpoint: string;
  baseAppURL: string;
  // Support for 2.9 configuration.
  baseControllerURL?: string | null;
  identityProviderAvailable: boolean;
  identityProviderURL: string;
  isJuju: boolean;
};

export type ControllerConnections = Record<string, ConnectionInfo>;

export type PingerIntervalIds = Record<string, number>;

export type Credential = {
  user: string;
  password: string;
};

export type Credentials = Record<string, Credential>;

export type ControllerFeatures = {
  // TODO: the crossModelQueries and auditLogs feature flags can be removed once JIMM facade 4 is available on
  // production JAAS.
  auditLogs?: boolean;
  crossModelQueries?: boolean;
};

export type ControllerFeaturesState = Record<string, ControllerFeatures>;

export type LoginErrors = Record<string, string>;

export type GeneralState = {
  appVersion: string | null;
  config: Config | null;
  connectionError?: string | null;
  controllerConnections: ControllerConnections | null;
  controllerFeatures: ControllerFeaturesState | null;
  credentials: Credentials | null;
  loginErrors: LoginErrors | null;
  pingerIntervalIds: PingerIntervalIds | null;
  visitURLs: string[] | null;
};
