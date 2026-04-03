import log from "loglevel";

declare global {
  interface Window {
    logger: log.Logger;
  }
}

if ("window" in globalThis) {
  window.logger = log.getLogger("JujuDashboard");
}

export const logger = log.getLogger("JujuDashboard");
