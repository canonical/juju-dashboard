import type { Browser, Page } from "@playwright/test";

import type { Action } from "../action";

import { CreateCandidUser, CreateLocalUser } from "./backends";
import { CreateOidcUser } from "./backends/oidc";

import type { AuthImplementation } from ".";

/**
 * Facilitates interactions with an `AuthImplementation.`
 *
 * An appropriate implementation will be selected when the constructor is run, based on `AUTH_MODE`
 * environment variable.
 */
export class Users {
  private static nextUserId = 0;
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
        this.CreateUser = CreateOidcUser;
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
    // TODO: (WD-21779) Temporary until OIDC is properly implemented
    if (process.env["AUTH_MODE"] === "oidc") {
      console.warn("Using hard-coded JIMM credentials as test");
      return new this.CreateUser("test@example.com", "test");
    }

    const id = Users.nextUserId++;
    return new this.CreateUser(`user${id}`, `password${id}`);
  }
}

export abstract class User {
  /**
   * Use this user to log into the dashboard.
   */
  abstract dashboardLogin(page: Page): Promise<void>;

  /**
   * Use this user to authenticate with the Juju CLI.
   */
  abstract cliLogin(): Promise<void>;

  /**
   * Get the user's credential.
   */
  abstract getCredential(): Promise<string>;

  /**
   * Get the username for this user suitable for use on the CLI.
   */
  abstract get cliUsername(): string;

  /**
   * Username that will be presented in the dashboard.
   */
  abstract get dashboardUsername(): string;
}
