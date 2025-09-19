import { JujuEnv, type Provider } from "../../fixtures/setup";
import { exec, generateRandomName } from "../../utils";
import type { Action } from "../action";
import type { JujuCLI } from "../juju-cli";
import { Application, type Model } from "../objects";
import { CharmName } from "../objects/application";

/**
 * Deploy a new application.
 */
export class DeployApplication implements Action<Application> {
  public application: Application;
  constructor(
    private model: Model,
    provider: Provider,
  ) {
    const charm = CharmName[provider];
    const name = generateRandomName(charm);
    this.application = new Application(name, charm, model);
  }

  async run(jujuCLI: JujuCLI) {
    if (jujuCLI.jujuEnv === JujuEnv.JIMM) {
      await jujuCLI.loginIdentityCLIAdmin();
    } else {
      await jujuCLI.loginLocalCLIAdmin();
    }
    await exec(
      `juju deploy '${this.application.charm}' '${this.application.name}' -m '${this.model.name}'`,
    );
    await exec(
      `juju wait-for application '${this.application.name}' --query='name=="${this.application.name}" && (status=="active" || status=="blocked" || status=="error")' || true`,
    );
  }

  async rollback() {
    await exec(
      `juju remove-application '${this.application.name}' -m '${this.model.name}' --force --destroy-storage --no-prompt --no-wait`,
    );
  }

  result(): Application {
    return this.application;
  }

  debug(): string {
    return `Deploy application '${this.application.name}'`;
  }
}
