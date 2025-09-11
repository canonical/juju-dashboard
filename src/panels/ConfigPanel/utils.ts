import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

import { secretIsAppOwned } from "utils";

import type { Config } from "./types";

export const getRequiredGrants = (
  appName: string,
  config: Config,
  secrets?: ListSecretResult[] | null,
): null | string[] => {
  const secretURIs = Object.values(config).reduce<string[]>((uris, entry) => {
    const value = entry.newValue ?? null;
    if (
      value !== null &&
      typeof value === "string" &&
      (entry.type === "secret" ||
        (entry.type === "string" && value.startsWith("secret:"))) &&
      // The same secret could be used in multiple fields so only include it once:
      !uris.includes(value)
    ) {
      uris.push(value);
    }
    return uris;
  }, []);
  return secrets
    ? secretURIs?.filter((secretURI) => {
        const secret = secrets.find(
          (secretItem) =>
            // Can't grant application owned secrets so ignore them.
            secretItem.uri === secretURI && !secretIsAppOwned(secretItem),
        );
        const access = secret?.access?.find(
          (accessInfo) => accessInfo["target-tag"] === `application-${appName}`,
        );
        return !!secret && !access;
      })
    : null;
};
