import { JujuEnv } from "../../fixtures/setup";
import { exec, generateRandomName } from "../../utils";
import type { Action } from "../action";
import type { User } from "../auth";
import type { JujuCLI } from "../juju-cli";
import { Model, ModelPermission } from "../objects";

import { GiveModelAccess } from "./giveModelAccess";

/**
 * Add a new model to the controller with the provided name and admin.
 */
export class AddModel implements Action<Model> {
  public model: Model;

  constructor(
    jujuCLI: JujuCLI,
    private admin: User,
    // Whether to create the model as the admin user. This is a slower
    // process as the CLI will need to change users, so should be used sparingly.
    private asOwner = false,
  ) {
    const name = generateRandomName("model");
    let owner = jujuCLI.identityAdmin;
    if (asOwner) {
      owner = this.admin;
    } else if (process.env.AUTH_MODE === "candid") {
      // When creating the model with the controller admin then we need to use the local user not the candid user.
      owner = jujuCLI.localAdmin;
    }
    this.model = new Model(name, owner);
  }

  async run(jujuCLI: JujuCLI): Promise<void> {
    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      // In JIMM models need to be added to the workloads controller.
      await exec(`juju switch '${jujuCLI.controller}'`);
    }
    await this.model.owner.cliLogin(jujuCLI.browser);
    await exec(`juju add-model '${this.model.name}'`);
    await exec(`juju wait-for model '${this.model.name}'`);
    // If the model wasn't created as the admin user, then give the admin access to the model.
    if (!this.asOwner) {
      const giveAccess = new GiveModelAccess(
        this.model,
        this.admin,
        ModelPermission.ADMIN,
      );
      await giveAccess.run(jujuCLI);
    }
  }

  async rollback(): Promise<void> {
    await exec(
      `juju destroy-model ${this.model.qualifiedName} --force --no-prompt --no-wait --destroy-storage --timeout 0`,
    );
  }

  result(): Model {
    return this.model;
  }

  debug(): string {
    return `Add model '${this.model.qualifiedName}' (owner: ${this.model.owner.cliUsername})`;
  }
}
