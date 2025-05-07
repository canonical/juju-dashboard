import { exec } from "../../utils";
import type { Action } from "../action";
import type { User } from "../auth";
import { Model } from "../objects";

/**
 * Add a new model to the controller with the provided name and owner.
 */
export class AddModel implements Action<Model> {
  public model: Model;
  private static nextModelId = 0;

  constructor(owner: User) {
    const id = AddModel.nextModelId++;
    this.model = new Model(`model${id}`, owner);
  }

  async run() {
    await this.model.owner.cliLogin();
    await exec(`juju add-model '${this.model.name}'`);
  }

  async rollback() {
    await this.model.owner.cliLogin();
    await exec(
      `juju destroy-model ${this.model.name} --force --no-prompt --no-wait --timeout 0`,
    );
  }

  result(): Model {
    return this.model;
  }

  debug(): string {
    return `Add model '${this.model.name}' (owner: ${this.model.owner.cliUsername})`;
  }
}
