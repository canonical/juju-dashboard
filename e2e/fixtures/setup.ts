import { test as base } from "@playwright/test";

import { JujuCLI } from "../helpers/juju-cli";
import { getEnv } from "../utils";

export enum JujuEnv {
  JIMM = "jimm",
  JUJU = "juju",
}

export enum Provider {
  LOCALHOST = "localhost",
  MICROK8S = "microk8s",
}

export type TestOptions = {
  controllerName: string;
  jujuEnv: JujuEnv;
  provider: Provider;
  admin: {
    name: string;
    password: string;
    identityName?: string | null;
    identityPassword?: string | null;
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

const JUJU_UPDATE_URL = "https://juju.is/latest.json";

export const test = base.extend<Fixtures>({
  testOptions: [
    {
      admin: {
        name: getEnv("ADMIN_USERNAME"),
        password: getEnv("ADMIN_PASSWORD"),
        identityName: getEnv("ADMIN_IDENTITY_USERNAME", null),
        identityPassword: getEnv("ADMIN_IDENTITY_PASSWORD", null),
      },
      controllerName: getEnv("CONTROLLER_NAME"),
      jujuEnv: getEnv("JUJU_ENV") as JujuEnv,
      provider: getEnv("PROVIDER") as Provider,
    },
    { option: true },
  ],
  jujuCLI: async ({ testOptions, browser }, use) => {
    await use(
      new JujuCLI(
        testOptions.jujuEnv,
        testOptions.controllerName,
        testOptions.provider,
        browser,
      ),
    );
  },
  page: async ({ page }, use) => {
    await page.route("**/*", async (route, request) => {
      // Speed up the tests by blocking requests such as the fonts on assets.ubuntu.com and icons from charmhub.io.
      const url = new URL(request.url());
      if (
        (url.hostname.includes("charmhub.io") ||
          url.hostname.includes("assets.ubuntu.com")) &&
        ["media", "font", "image"].includes(request.resourceType())
      ) {
        console.debug("Blocked external request:", request.url());
        await route.abort();
      } else if (url.toString() === JUJU_UPDATE_URL) {
        console.debug(`Blocking update check to \`${JUJU_UPDATE_URL}\``);
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await use(page);
  },
});

export default test;
