import { JujuEnv } from "../../fixtures/setup";
import { exec, generateRandomName } from "../../utils";
import type { Action } from "../action";
import type { User } from "../auth";
import type { JujuCLI } from "../juju-cli";
import { Model, ModelPermission } from "../objects";

import { GiveModelAccess } from "./giveModelAccess";

/**
 * Add a new model to the controller with the provided name and owner.
 */
export class AddModel implements Action<Model> {
  public model: Model;

  constructor(
    jujuCLI: JujuCLI,
    private admin: User,
  ) {
    const name = generateRandomName("model");
    this.model = new Model(name, jujuCLI.identityAdmin);
  }

  async run(jujuCLI: JujuCLI) {
    if (jujuCLI.jujuEnv == JujuEnv.JIMM) {
      // In JIMM models need to be added to the workloads controller.
      await exec(`juju switch '${jujuCLI.controller}'`);
    }
    // await this.model.owner.cliLogin(jujuCLI.browser);
    await exec(`juju add-model '${this.model.name}'`);
    // TODO
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await exec(`juju status`);
    const giveAccess = new GiveModelAccess(
      this.model,
      this.admin,
      ModelPermission.ADMIN,
    );
    await giveAccess.run(jujuCLI);
  }

  async rollback(jujuCLI: JujuCLI) {
    if (jujuCLI.jujuEnv == JujuEnv.JIMM) {
      await exec(`juju switch '${jujuCLI.controller}'`);
    }
    // await this.model.owner.cliLogin(jujuCLI.browser);
    await exec(
      `juju destroy-model ${this.model.name} --force --no-prompt --no-wait --destroy-storage --timeout 0`,
    );
  }

  result(): Model {
    return this.model;
  }

  debug(): string {
    return `Add model '${this.model.name}' (owner: ${this.model.owner.cliUsername})`;
  }
}
