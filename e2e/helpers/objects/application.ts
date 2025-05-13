/**
 * Charm to deploy based on provider.
 */
export enum CharmName {
  localhost = "anbox-cloud-dashboard",
  microk8s = "hello-kubecon",
}

/**
 * Action to run.
 */
export enum ActionName {
  "anbox-cloud-dashboard" = "backup",
  "hello-kubecon" = "pull-site",
}

/**
 * Config property to change.
 */
export enum ConfigName {
  "anbox-cloud-dashboard" = "location",
  "hello-kubecon" = "redirect-map",
}

export class Application {
  public action: string;
  public config: string;
  constructor(
    public name: string,
    public charm: CharmName,
  ) {
    this.action = ActionName[charm];
    this.config = ConfigName[charm];
  }
}
