import { Config } from "store/general/types";

export type TSFixMe = any;

declare global {
  interface Window {
    jujuDashboardConfig?: Config;
  }
}
