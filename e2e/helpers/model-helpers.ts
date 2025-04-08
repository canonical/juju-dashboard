import { execSync } from "child_process";

import { type Page } from "@playwright/test";

export enum CloudAccessTypes {
  ADD_MODEL = "add-model",
}

export enum ModelAccessTypes {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export class ModelHelpers {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async addModel(modelName: string) {
    execSync(`juju add-model ${modelName}`);
  }

  async addUser(userName: string) {
    return execSync(
      `juju add-user --controller ${process.env.CONTROLLER_NAME} ${userName}`,
    ).toString();
  }

  async grantCloud(userName: string, accessType: CloudAccessTypes) {
    execSync(
      `juju grant-cloud ${userName} ${accessType} ${process.env.PROVIDER}`,
    );
  }

  async jujuLogout() {
    execSync("juju logout");
  }

  async jujuLogin(
    userName: string,
    password: string | undefined = process.env.PASSWORD,
  ) {
    if (!password) {
      throw new Error("Cannot login without password");
    }
    execSync(`echo ${password} | juju login -u ${userName} --no-prompt`);
  }

  async registerUser(registrationString: string) {
    execSync(
      `{ echo password2; echo password2; echo ${process.env.CONTROLLER_NAME}; echo password2; } | juju register --replace ${registrationString}`,
    );
  }

  async addCredential() {
    execSync(
      `juju add-credential ${process.env.PROVIDER} -f e2e/helpers/dummy-credentials.yaml -c ${process.env.CONTROLLER_NAME}`,
    );
  }

  async grantModelAccess(
    userName: string,
    accessType: ModelAccessTypes,
    modelName: string,
  ) {
    execSync(`juju grant ${userName} ${accessType} ${modelName}`);
  }

  async addSharedModel(modelName: string, userName: string) {
    const currentUserName = execSync(
      `juju whoami | grep "User:" | sed 's/^User: //'`,
    )
      .toString()
      .trim();
    const output = (await this.addUser(userName)).toString();
    const registrationString = output.split("\n")[2].trim().split(" ")[2];
    await this.grantCloud(userName, CloudAccessTypes.ADD_MODEL);
    await this.jujuLogout();
    await this.registerUser(registrationString);
    await this.addCredential();
    await this.addModel(modelName);
    await this.grantModelAccess(
      currentUserName,
      ModelAccessTypes.READ,
      modelName,
    );
    await this.jujuLogout();
    await this.jujuLogin(currentUserName, process.env.PASSWORD);
    execSync("juju switch controller");
  }
}
