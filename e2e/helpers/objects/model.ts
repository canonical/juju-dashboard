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

  public get qualifiedName(): string {
    return `${this.owner.cliUsername}/${this.name}`;
  }

  public get url(): string {
    return urls.model.index({
      userName: this.owner.cliUsername,
      modelName: this.name,
    });
  }

  public tab(tab: ModelTab): string {
    return urls.model.tab({
      userName: this.owner.cliUsername,
      modelName: this.name,
      tab,
    });
  }
}
