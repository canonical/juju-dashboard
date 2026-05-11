import urls from "urls";

import type { Model } from "../objects";

// spell-checker:ignore pgbouncer

/**
 * Charm to deploy based on provider.
 */
export enum CharmName {
  // spell
  localhost = "any-charm",
  microk8s = "any-charm",
}

/**
 * Action to run.
 */
export enum ActionName {
  "any-charm" = "get-relation-data",
}

/**
 * Config property to change.
 */
export enum ConfigName {
  "any-charm" = "python-packages",
}

export const CHARM_DEPLOY_ARGS = {
  localhost: "--channel beta",
  // --trust is required for the k8s charm to access secrets.
  microk8s: "--channel beta --trust",
};

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
