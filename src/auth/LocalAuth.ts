import type { Credentials } from "@canonical/jujulib";

import type { AuthCredential } from "store/general/types";
import type { AppDispatch } from "store/store";

import { Auth } from "./Auth";

import { AuthMethod } from ".";

export class LocalAuth extends Auth {
  constructor(dispatch: AppDispatch) {
    super(dispatch, AuthMethod.LOCAL);
  }

  determineCredentials(
    credential?: AuthCredential | null,
  ): Credentials | undefined {
    if (!credential) {
      return;
    }

    return {
      username: credential.user,
      password: credential.password,
    };
  }
}
