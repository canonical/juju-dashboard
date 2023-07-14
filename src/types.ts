import type { Config } from "store/general/types";

declare global {
  interface Window {
    jujuDashboardConfig?: Config;
  }
}
