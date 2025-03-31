import type { Credentials } from "@canonical/jujulib";

import type { Credential } from "store/general/types";
import { AuthMethod } from "store/general/types";
import type { AppDispatch } from "store/store";

import { Auth } from "./Auth";

export class LocalAuth extends Auth {
  constructor(dispatch: AppDispatch) {
    super(dispatch, AuthMethod.LOCAL);
  }

  determineCredentials(
    credential?: Credential | null,
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
