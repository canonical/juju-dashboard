/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";

import { AuthHelpers } from "../helpers/auth-helpers";
import { JujuHelpers } from "../helpers/juju-helpers";

export type TestOptions = {
  controllerName: string;
  provider: string;
  primaryUser: {
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

export const test = base.extend<Fixtures>({
  testOptions: [
    {
      primaryUser: {
        name: process.env.USERNAME ?? "",
        password: process.env.PASSWORD ?? "",
      },
      secondaryUser: {
        name: process.env.SECONDARY_USERNAME ?? "",
        password: process.env.SECONDARY_PASSWORD ?? "",
      },
      controllerName: process.env.CONTROLLER_NAME ?? "",
      provider: process.env.PROVIDER ?? "",
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
