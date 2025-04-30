import fs from "node:fs/promises";

import {
  type Resource,
  CloudAccessTypes,
  ModelAccessTypes,
  ResourceType,
  type TestOptions,
} from "../fixtures/setup";
import { exec } from "../utils/exec";

export class JujuHelpers {
  private cleanupStack: Resource[];
  readonly admin: {
    name: string;
    password: string;
  };
  readonly secondaryUser: {
    name: string;
    password: string;
  };
  readonly provider: string;
  readonly controllerName: string;

  constructor(testOptions: TestOptions, cleanupStack?: Resource[]) {
    this.admin = testOptions.admin;
    this.secondaryUser = testOptions.secondaryUser;
    this.provider = testOptions.provider;
    this.controllerName = testOptions.controllerName;

    this.cleanupStack = cleanupStack || [];
  }

  async removeModel(modelName: string, owner: string = this.admin.name) {
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

  async addToCleanupStack(
    resourceName: string,
    type: ResourceType,
    owner: string = this.admin.name,
  ) {
    this.cleanupStack.push({ resourceName, type, owner });
  }

  async addModel(modelName: string, owner: string = this.admin.name) {
    await exec(`juju add-model '${modelName}'`);
    await this.addToCleanupStack(modelName, ResourceType.MODEL, owner);
  }

  async addUser(
    userName: string,
    password: string = this.secondaryUser.password,
  ) {
    await exec(
      `juju add-user --controller '${this.controllerName}' '${userName}'`,
    );
    await this.addToCleanupStack(userName, ResourceType.USER);
    await exec(
      `{ echo ${password}; echo ${password}; } | juju change-user-password '${userName}'`,
    );
  }

  async grantCloud(userName: string, accessType: CloudAccessTypes) {
    await exec(`juju grant-cloud '${userName}' ${accessType} ${this.provider}`);
    await this.addToCleanupStack(accessType, ResourceType.CLOUD, userName);
  }

  async jujuLogout() {
    await exec("juju logout");
  }

  async jujuLogin(
    userName: string = this.admin.name,
    password: string = this.admin.password,
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
    userName: string = this.admin.name,
  ) {
    await exec(`juju grant '${userName}' ${accessType} '${modelName}'`);
  }

  async addSharedModel(modelName: string, userName: string) {
    await this.addUser(userName);
    await this.grantCloud(userName, CloudAccessTypes.ADD_MODEL);
    await this.jujuLogout();
    await this.jujuLogin(userName, this.secondaryUser.password);
    await this.addCredential(userName, this.secondaryUser.password);
    await this.addModel(modelName, userName);
    await this.grantModelAccess(ModelAccessTypes.READ, modelName);
  }

  async cleanup() {
    console.log("Running Juju cleanup...");
    await this.adminLogin();

    while (this.cleanupStack.length > 0) {
      const resource = this.cleanupStack.pop();
      if (resource) {
        const { resourceName, type, owner } = resource;
        console.log(`Removing Juju ${type}: ${resourceName}`);
        try {
          if (type === ResourceType.MODEL) {
            await this.removeModel(resourceName, owner);
          } else if (type === ResourceType.USER) {
            await this.removeUser(resourceName);
          } else if (type === ResourceType.CLOUD) {
            await this.revokeCloud(resourceName, owner);
          }
        } catch (error) {
          console.warn(`Error removing ${type} ${resourceName}:`, error);
        }
      }
    }
  }
}
