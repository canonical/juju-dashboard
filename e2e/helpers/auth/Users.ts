import type { Browser, Page } from "@playwright/test";

import { generateRandomName } from "../../utils";
import type { Action } from "../action";

import { CreateOIDCUser, CreateCandidUser, CreateLocalUser } from "./backends";

import type { AuthImplementation } from ".";

/**
 * Facilitates interactions with an `AuthImplementation.`
 *
 * An appropriate implementation will be selected when the constructor is run, based on `AUTH_MODE`
 * environment variable.
 */
export class Users {
  private CreateUser: AuthImplementation;

  constructor(browser: Browser) {
    switch (process.env.AUTH_MODE) {
      case "local":
        this.CreateUser = CreateLocalUser;
        break;
      case "candid":
        CreateCandidUser.prepare(browser);
        this.CreateUser = CreateCandidUser;
        break;
      case "oidc":
        this.CreateUser = CreateOIDCUser;
        break;
      default:
        throw new Error(
          `Unknown auth mode: ${process.env.AUTH_MODE} (ensure that \`AUTH_MODE\` env var is correct set)`,
        );
    }
  }

  /**
   * Create a dummy user instance with the provided credentials.
   *
   * This user will not be created by the auth implementation.
   */
  createUserInstance(username: string, password: string): User {
    return new this.CreateUser(username, password).result();
  }

  /**
   * Produce an action which will create a user.
   */
  createUser(): Action<User> {
    const name = generateRandomName("user");
    return new this.CreateUser(name, "password");
  }
}

export abstract class User {
  /**
   * Use this user to log into the dashboard.
   */
  abstract dashboardLogin(
    page: Page,
    url: string,
    expectError?: boolean,
  ): Promise<void>;

  /**
   * Use this user to log into the dashboard.
   */
  abstract reloadDashboard(page: Page): Promise<void>;

  /**
   * Use this user to authenticate with the Juju CLI.
   */
  abstract cliLogin(): Promise<void>;

  /**
   * Get the username for this user suitable for use on the CLI.
   */
  abstract get cliUsername(): string;

  /**
   * Username that will be presented in the dashboard.
   */
  abstract get dashboardUsername(): string;

  /**
   * Display name that will be presented in the dashboard.
   */
  abstract get displayName(): string;
}
