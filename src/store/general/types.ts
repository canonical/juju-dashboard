import { TSFixMe } from "types";

export type Config = {
  controllerAPIEndpoint: string;
  baseAppURL: string;
  identityProviderAvailable: boolean;
  identityProviderURL: string;
  isJuju: boolean;
};

// TSFixMe: This should use the ConnectionInfo type once it has been exported
// from jujulib.
export type ControllerConnections = Record<string, TSFixMe>;

export type PingerIntervalIds = Record<string, number>;

export type GeneralState = {
  appVersion: string | null;
  config: Config | null;
  controllerConnections: ControllerConnections | null;
  // TSFixMe: This should use the Credentials type once it has been exported
  // from jujulib.
  credentials: TSFixMe | null;
  loginError: string | null;
  pingerIntervalIds: PingerIntervalIds | null;
  visitURL: string | null;
};
