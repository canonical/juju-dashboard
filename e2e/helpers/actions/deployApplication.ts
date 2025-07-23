import type { Provider } from "../../fixtures/setup";
import { exec, generateRandomName } from "../../utils";
import { StatusError } from "../../utils/exec";
import type { Action } from "../action";
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

  async run() {
    await this.model.owner.cliLogin();
    await exec(
      "juju",
      "deploy",
      this.application.charm,
      this.application.name,
      "-m",
      this.model.name,
    ).exit;
    await exec(
      "juju",
      "wait-for",
      "application",
      this.application.name,
      `--query='name=="${this.application.name}" && (status=="active" || status=="blocked" || status=="error")'`,
    ).exit.catch((err) => {
      // Ignore non-zero status codes
      if (err instanceof StatusError) {
        return;
      }

      throw err;
    });
  }

  async rollback() {
    await this.model.owner.cliLogin();
    await exec(
      "juju",
      "remove-application",
      this.application.name,
      "-m",
      this.model.name,
      "--force",
      "--destroy-storage",
      "--no-prompt",
      "--no-wait",
    ).exit;
  }

  result(): Application {
    return this.application;
  }

  debug(): string {
    return `Deploy application '${this.application.name}'`;
  }
}
