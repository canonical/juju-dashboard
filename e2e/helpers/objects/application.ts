/**
 * Charm to deploy based on provider.
 */
export const CharmName = {
  localhost: "anbox-cloud-dashboard",
  microk8s: "hello-kubecon",
};

/**
 * Action to run.
 */
export const ActionName = {
  "anbox-cloud-dashboard": "backup",
  "hello-kubecon": "pull-site",
};

export class Application {
  public action: string;
  constructor(
    public name: string,
    public charm: string,
  ) {
    this.action = ActionName[charm as keyof typeof ActionName];
  }
}
