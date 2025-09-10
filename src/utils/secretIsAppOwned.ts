import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

const secretIsAppOwned = (secret: ListSecretResult): boolean =>
  secret["owner-tag"].startsWith("application-");

export default secretIsAppOwned;
