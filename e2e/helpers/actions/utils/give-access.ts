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
    private jimmAccess: Map<string, string>,
    private tag: string,
  ) {}

  private async action(
    jujuCLI: JujuCLI,
    jujuCommand: string,
    jimmCommand: string,
  ) {
    if (jujuCLI.jujuEnv == JujuEnv.JUJU) {
      await this.entity.owner.cliLogin();
      await exec(
        `juju ${jujuCommand} '${this.user.cliUsername}' '${this.access}' '${this.entity.name}'`,
      );
    } else {
      await jujuCLI.loginIdentityCLIAdmin();
      await exec(
        `jimmctl auth relation ${jimmCommand} 'user-${this.user.cliUsername}' '${this.jimmAccess.get(this.access)}' '${[this.tag, this.entityName].join("-")}'`,
      );
    }
  }

  get entityName(): string {
    return this.entity.name;
  }

  async run(jujuCLI: JujuCLI) {
    await this.action(jujuCLI, "grant", "add");
  }

  async rollback(jujuCLI: JujuCLI) {
    await this.action(jujuCLI, "revoke", "remove");
  }

  result(): void {}

  debug(): string {
    return `Grant '${this.user.cliUsername}' '${this.access}' access to '${this.entity.name}' (owner: ${this.entity.owner.cliUsername})`;
  }
}
