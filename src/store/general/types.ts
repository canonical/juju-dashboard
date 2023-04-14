import type { ConnectionInfo } from "@canonical/jujulib";

export type Config = {
  controllerAPIEndpoint: string;
  baseAppURL: string;
  // Support for 2.9 configuration.
  baseControllerURL?: string;
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

export type GeneralState = {
  appVersion: string | null;
  config: Config | null;
  connectionError?: string | null;
  controllerConnections: ControllerConnections | null;
  credentials: Credentials | null;
  loginError: string | null;
  pingerIntervalIds: PingerIntervalIds | null;
  visitURL: string | null;
};
