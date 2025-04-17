import { exec } from "../../utils";
import type { Action } from "../action";
import type { User } from "../auth";
import type { JujuCLI } from "../juju-cli";
import type { Model, ModelGrantPermission } from "../objects";

/**
 * Grant a user access to a mdoel.
 */
export class GrantModelAccess implements Action<void> {
  constructor(
    private model: Model,
    private user: User,
    private access: ModelGrantPermission,
  ) {}

  async run(_: JujuCLI) {
    await this.model.owner.cliLogin();

    await exec(
      `juju grant '${this.user.cliUsername}' '${this.access}' '${this.model.name}'`,
    );
  }

  async rollback() {
    await this.model.owner.cliLogin();

    await exec(
      `juju revoke '${this.user.cliUsername}' '${this.access}' '${this.model.name}'`,
    );
  }

  result(): void {}

  debug(): string {
    return `Grant '${this.user.cliUsername}' '${this.access}' access to '${this.model.name}' (owner: ${this.model.owner.cliUsername})`;
  }
}
