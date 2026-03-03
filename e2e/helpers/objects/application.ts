import urls from "urls";

import type { Model } from "../objects";

// spell-checker:ignore pgbouncer

/**
 * Charm to deploy based on provider.
 */
export enum CharmName {
  // spell
  localhost = "anbox-cloud-dashboard",
  microk8s = "pgbouncer-k8s",
}

/**
 * Action to run.
 */
export enum ActionName {
  "anbox-cloud-dashboard" = "backup",
  "pgbouncer-k8s" = "pre-upgrade-check",
}

/**
 * Config property to change.
 */
export enum ConfigName {
  "anbox-cloud-dashboard" = "location",
  "pgbouncer-k8s" = "pool_mode",
}

export class Application {
  public action: string;
  public config: string;
  constructor(
    public name: string,
    public charm: CharmName,
    public model: Model,
  ) {
    this.action = ActionName[charm];
    this.config = ConfigName[charm];
  }

  public get url(): string {
    return urls.model.app.index({
      qualifier: this.model.owner.dashboardUsername,
      modelName: this.model.name,
      appName: this.name,
    });
  }
}
