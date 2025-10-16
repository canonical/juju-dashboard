import { JujuEnv } from "../../../fixtures/setup";
import { exec, execIfModelExists } from "../../../utils";
import type { Action } from "../../action";
import type { User } from "../../auth";
import type { JujuCLI } from "../../juju-cli";
import type { Controller, Model } from "../../objects";

/**
 * Give a user access to a controller or model.
 * Note: application offers are also granted in the same way but this does not currently support them.
 */
export class GiveAccess<Entity extends Controller | Model>
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
    isRollback?: boolean,
  ): Promise<void> {
    if (jujuCLI.jujuEnv == JujuEnv.JUJU) {
      const entityName =
        this.tag === "controller" ? "" : `'${this.entityName}'`;
      await jujuCLI.loginLocalCLIAdmin();
      const command = `juju ${jujuCommand} '${this.user.cliUsername}' '${this.access}' '${entityName}'`;
      if (isRollback && this.tag === "model") {
        await execIfModelExists(command, entityName);
      } else {
        await exec(command);
      }
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

  async run(jujuCLI: JujuCLI): Promise<void> {
    await this.action(jujuCLI, "grant", "add-permission");
  }

  async rollback(jujuCLI: JujuCLI): Promise<void> {
    await this.action(jujuCLI, "revoke", "remove-permission", true);
  }

  result(): void {}

  debug(): string {
    return `Grant '${this.user.cliUsername}' '${this.access}' access to '${this.entity.name}' (owner: ${this.entity.owner.cliUsername})`;
  }
}
