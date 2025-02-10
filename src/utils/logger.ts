import log from "loglevel";

declare global {
  interface Window {
    logger: log.Logger;
  }
}

window.logger = log.getLogger("JujuDashboard");

export const logger = log.getLogger("JujuDashboard");
