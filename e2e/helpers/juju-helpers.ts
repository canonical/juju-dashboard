import fs from "node:fs/promises";

import { exec } from "utils/exec";

import {
  CloudAccessTypes,
  ModelAccessTypes,
  type TestOptions,
} from "../fixtures/setup";

const generateRandomModelName = () =>
  `model-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`;

const generateRandomUserName = () =>
  `user-${new Date().getTime()}-${Math.floor(Math.random() * 10000)}`;

export class JujuHelpers {
  private cleanupStack: (() => Promise<void>)[];
  readonly primaryUser: {
    name: string;
    password: string;
  };
  readonly secondaryUserPassword: string;
  readonly provider: string;
  readonly controllerName: string;

  constructor(
    testOptions: TestOptions,
    cleanupStack?: (() => Promise<void>)[],
  ) {
    this.primaryUser = testOptions.primaryUser;
    this.secondaryUserPassword = testOptions.secondaryUserPassword;
    this.provider = testOptions.provider;
    this.controllerName = testOptions.controllerName;

    this.cleanupStack = cleanupStack || [];
  }

  async removeModel(modelName: string, owner: string = this.primaryUser.name) {
    await exec(
      `juju destroy-model '${owner}/${modelName}' --force --no-prompt`,
    );
  }

  async removeUser(userName: string) {
    await exec(`juju remove-user '${userName}' -y`);
  }

  async revokeCloud(accessType: string | CloudAccessTypes, userName?: string) {
    await exec(
      `juju revoke-cloud '${userName}' ${accessType} ${this.provider}`,
    );
  }

  async addModel(
    owner: string = this.primaryUser.name,
    modelName: string = generateRandomModelName(),
  ) {
    await exec(`juju add-model '${modelName}'`);
    this.cleanupStack.push(() => this.removeModel(modelName, owner));
    return modelName;
  }

  async addUser(
    userName: string = generateRandomUserName(),
    password: string = this.secondaryUserPassword,
  ) {
    await exec(
      `juju add-user --controller '${this.controllerName}' '${userName}'`,
    );
    this.cleanupStack.push(() => this.removeUser(userName));
    await exec(
      `{ echo ${password}; echo ${password}; } | juju change-user-password '${userName}'`,
    );
    return userName;
  }

  async grantCloud(userName: string, accessType: CloudAccessTypes) {
    await exec(`juju grant-cloud '${userName}' ${accessType} ${this.provider}`);
    this.cleanupStack.push(() => this.revokeCloud(accessType, userName));
  }

  async jujuLogout() {
    await exec("juju logout");
  }

  async jujuLogin(
    userName: string = this.primaryUser.name,
    password: string = this.primaryUser.password,
  ) {
    await exec(`echo '${password}' | juju login -u '${userName}' --no-prompt`);
  }

  async adminLogin() {
    await this.jujuLogout();
    await this.jujuLogin();
    await exec("juju switch controller");
  }

  async addCredential(userName: string, password: string) {
    const templateFilePath = "e2e/helpers/credentials-template.yaml";
    try {
      let yamlContent = await fs.readFile(templateFilePath, "utf-8");

      yamlContent = yamlContent.replace(/\{\{username\}\}/g, userName);
      yamlContent = yamlContent.replace(/\{\{password\}\}/g, password);

      const tmpFilePath = `e2e/helpers/juju-cred-${Date.now()}.yaml`;
      await fs.writeFile(tmpFilePath, yamlContent, "utf8");

      await exec(
        `juju add-credential ${this.provider} -f ${tmpFilePath} -c '${this.controllerName}'`,
      );
      await fs.unlink(tmpFilePath);
    } catch (error) {
      console.error("Error setting up credentials:", error);
      throw error;
    }
  }

  async grantModelAccess(
    accessType: ModelAccessTypes,
    modelName: string,
    userName: string = this.primaryUser.name,
  ) {
    await exec(`juju grant '${userName}' ${accessType} '${modelName}'`);
  }

  async addSharedModel(userName: string = generateRandomUserName()) {
    await this.addUser(userName);
    await this.grantCloud(userName, CloudAccessTypes.ADD_MODEL);
    await this.jujuLogout();
    await this.jujuLogin(userName, this.secondaryUserPassword);
    await this.addCredential(userName, this.secondaryUserPassword);
    const modelName = await this.addModel(userName);
    await this.grantModelAccess(ModelAccessTypes.READ, modelName);
    return { modelName, userName };
  }

  async cleanup() {
    console.log("Running Juju cleanup...");
    await this.adminLogin();

    while (this.cleanupStack.length > 0) {
      const cleanupFunction = this.cleanupStack.pop();
      if (cleanupFunction) {
        try {
          await cleanupFunction();
        } catch (error) {
          console.warn(`Error removing cleaning up resource`, error);
        }
      }
    }
  }
}
