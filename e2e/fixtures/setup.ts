import { test as base } from "@playwright/test";

import { JujuCLI } from "../helpers/juju-cli";

export type TestOptions = {
  controllerName: string;
  provider: string;
  admin: {
    name: string;
    password: string;
  };
};

export type Fixtures = {
  testOptions: TestOptions;
  jujuCLI: JujuCLI;
};

export enum CloudAccessType {
  ADD_MODEL = "add-model",
}

export enum ModelAccessTypes {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export enum ResourceType {
  MODEL = "MODEL",
  USER = "USER",
  CLOUD = "CLOUD",
}

export type Resource = {
  resourceName: string | CloudAccessType;
  type: ResourceType;
  owner?: string;
};

function getEnv(key: string): string {
  if (!(key in process.env)) {
    throw new Error(`${key} not present in environment`);
  }

  return process.env[key] as string;
}

export const test = base.extend<Fixtures>({
  testOptions: [
    {
      admin: {
        name: getEnv("ADMIN_USERNAME"),
        password: getEnv("ADMIN_PASSWORD"),
      },
      controllerName: getEnv("CONTROLLER_NAME"),
      provider: getEnv("PROVIDER"),
    },
    { option: true },
  ],
  jujuCLI: async ({ testOptions, browser }, use) => {
    await use(
      new JujuCLI(testOptions.controllerName, testOptions.provider, browser),
    );
  },
});

export default test;
