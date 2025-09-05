import type { ModelTab } from "urls";
import urls from "urls";

import type { User } from "../auth";

/**
 * Permissions that may be granted on a model.
 */
export enum ModelPermission {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export class Model {
  constructor(
    public name: string,
    public owner: User,
  ) {}

  public get path(): string {
    let username = this.owner.cliUsername;
    if (process.env.AUTH_VARIANT == "keycloak") {
      username = `${this.owner.dashboardUsername}@canonical.com`;
    } else if (process.env.AUTH_MODE == "candid") {
      username = this.owner.dashboardUsername.replace("@external", "");
    }
    return `${username}/${this.name}`;
  }

  public get url(): string {
    let username = this.owner.cliUsername;
    if (process.env.AUTH_VARIANT == "keycloak") {
      username = `${this.owner.dashboardUsername}@canonical.com`;
    } else if (process.env.AUTH_MODE == "candid") {
      username = this.owner.dashboardUsername.replace("@external", "");
    }
    return urls.model.index({
      userName: username,
      modelName: this.name,
    });
  }

  public tab(tab: ModelTab): string {
    let username = this.owner.cliUsername;
    if (process.env.AUTH_VARIANT == "keycloak") {
      username = `${this.owner.dashboardUsername}@canonical.com`;
    } else if (process.env.AUTH_MODE == "candid") {
      username = this.owner.dashboardUsername.replace("@external", "");
    }
    return urls.model.tab({
      userName: username,
      modelName: this.name,
      tab,
    });
  }
}
