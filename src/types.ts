import { Config } from "store/general/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TSFixMe = any;

declare global {
  interface Window {
    jujuDashboardConfig?: Config;
  }
}
