/* eslint-disable @typescript-eslint/no-unused-vars -- This file contains a base class with a lot
   of unused paramters. */

import type { ConnectOptions, Credentials } from "@canonical/jujulib";

import type { AuthCredential } from "store/general/types";
import type { AppDispatch } from "store/store";
import { logger } from "utils/logger";

import type { AuthMethod } from ".";

export type ControllerData = {
  wsControllerURL: string;
  credentials?: AuthCredential;
};

/**
 * Base class for authentication providers. The stubbed lifecycle methods are called throughout the
 * dashboard. Authentication implementations should extend this class and override the relevant
 * methods.
 *
 * This class should be consumed as a singleton via the `instance` property (eg.
 * `Auth.instance.logout()`). The singleton is set in the base class's constructor.
 */
export class Auth {
  /**
   * Singleton instance of the auth provider.
   */
  static instance: Auth;

  /**
   * Redux dispatch method for use within auth implementations.
   */
  protected dispatch: AppDispatch;

  /**
   * Identifier of the auth method.
   */
  public name: AuthMethod;

  /**
   * Create a new instance of the singleton using the provided store dispatch, and auth method
   * name. This constructor should only be called once (including via extended classes), as it will
   * override the previously instantiated singleton instance.
   */
  constructor(dispatch: AppDispatch, name: AuthMethod) {
    if (Auth.instance) {
      logger.warn(
        "Singleton instance already exists, and is being re-constructed. Overriding previous instance with incoming.",
      );
    }

    Auth.instance = this;
    this.dispatch = dispatch;
    this.name = name;
  }

  /**
   * Executed at the conclusion of the dashboard's bootstrap method.
   */
  async bootstrap(): Promise<void> {}

  /**
   * Logout functionality for the authentication provider.
   */
  async logout(): Promise<void> {}

  /**
   * Executed before a connection is initiated with a controller.
   *
   * @returns Whether to continue the connection attempt.
   */
  async beforeControllerConnect(
    controllerData: ControllerData,
  ): Promise<boolean> {
    return true;
  }

  /**
   * Produces `ConnectOptions` for jujulib.
   *
   * @returns Connection options to merge with existing jujulib connection options.
   */
  jujulibConnectOptions(): Partial<ConnectOptions> | undefined {
    return undefined;
  }

  /**
   * Produces login parameters to use with jujulib.
   *
   * @returns Credentials to provide to jujulib for connection.
   */
  determineCredentials(
    credential?: AuthCredential | null,
  ): Credentials | undefined {
    return undefined;
  }
}
