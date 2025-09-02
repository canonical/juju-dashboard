import { JujuEnv } from "../../../fixtures/setup";
import { exec } from "../../../utils";
import type { Action } from "../../action";
import type { User } from "../../auth";
import type { JujuCLI } from "../../juju-cli";
import type { Controller, Model } from "../../objects";

/**
 * Give a user access to a controller or model.
 * Note: application offers are also granted in the same way but this does not currently support them.
 */
export class GiveAccess<Entity extends Model | Controller>
  implements Action<void>
{
  constructor(
    public entity: Entity,
    private user: User,
    private access: string,
    private jimmAccess: Record<string, string>,
    private tag: string,
  ) {}

  private async action(
    jujuCLI: JujuCLI,
    jujuCommand: string,
    jimmCommand: string,
  ) {
    if (jujuCLI.jujuEnv == JujuEnv.JUJU) {
      const entityName =
        this.tag === "controller" ? "" : `'${this.entityName}'`;
      await this.entity.owner.cliLogin(jujuCLI.browser);
      await exec(
        `juju ${jujuCommand} '${this.user.cliUsername}' '${this.access}' '${entityName}'`,
      );
    } else {
      await jujuCLI.loginIdentityCLIAdmin();
      await exec(
        `juju jaas ${jimmCommand} 'user-${this.user.cliUsername}' '${this.jimmAccess[this.access]}' '${[this.tag, this.entityName].join("-")}'`,
      );
    }
  }

  get entityName(): string {
    return this.entity.name;
  }

  async run(jujuCLI: JujuCLI) {
    await this.action(jujuCLI, "grant", "add-permission");
  }

  async rollback(jujuCLI: JujuCLI) {
    await this.action(jujuCLI, "revoke", "remove-permission");
  }

  result(): void {}

  debug(): string {
    return `Grant '${this.user.cliUsername}' '${this.access}' access to '${this.entity.name}' (owner: ${this.entity.owner.cliUsername})`;
  }
}
