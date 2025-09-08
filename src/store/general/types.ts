import type { ConnectionInfo } from "@canonical/jujulib";

export type Config = {
  analyticsEnabled: boolean;
  baseAppURL: string;
  // Support for 2.9 configuration.
  baseControllerURL?: string | null;
  controllerAPIEndpoint: string;
  identityProviderURL: string;
  isJuju: boolean;
};

export type ControllerConnections = Record<string, ConnectionInfo>;

export type PingerIntervalIds = Record<string, number>;

export type AuthCredential = {
  user: string;
  password: string;
};

export type Credentials = Record<string, AuthCredential>;

export type ControllerFeatures = {
  // TODO: the crossModelQueries and auditLogs feature flags can be removed once JIMM facade 4 is available on
  // production JAAS.
  auditLogs?: boolean;
  crossModelQueries?: boolean;
  rebac?: boolean;
};

export type ControllerFeaturesState = Record<string, ControllerFeatures>;

export type Login = {
  errors?: Record<string, string>;
  loading?: boolean;
};

export type GeneralState = {
  appVersion: string | null;
  config: Config | null;
  connectionError?: string | null;
  controllerConnections: ControllerConnections | null;
  controllerFeatures: ControllerFeaturesState | null;
  credentials: Credentials | null;
  login: Login | null;
  pingerIntervalIds: PingerIntervalIds | null;
  visitURLs: string[] | null;
};
