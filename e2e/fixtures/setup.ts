/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";
import { JujuHelpers } from "../helpers/juju-helpers";

export type TestOptions = {
  controllerName: string;
  provider: string;
  admin: {
    name: string;
    password: string;
  };
  secondaryUser: {
    name: string;
    password: string;
  };
};

type Fixtures = {
  authHelpers: AuthHelpers;
  jujuHelpers: JujuHelpers;
  testOptions: TestOptions;
};

export enum CloudAccessTypes {
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
  resourceName: string | CloudAccessTypes;
  type: ResourceType;
  owner?: string;
};

const cleanupStack: Resource[] = [];

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
      secondaryUser: {
        name: getEnv("SECONDARY_USERNAME"),
        password: getEnv("SECONDARY_PASSWORD"),
      },
      controllerName: getEnv("CONTROLLER_NAME"),
      provider: getEnv("PROVIDER"),
    },
    { option: true },
  ],
  authHelpers: async ({ page, testOptions }, use) => {
    await use(new AuthHelpers(page, testOptions));
  },
  jujuHelpers: async ({ testOptions }, use) => {
    await use(new JujuHelpers(testOptions, cleanupStack));
  },
});

export default test;
