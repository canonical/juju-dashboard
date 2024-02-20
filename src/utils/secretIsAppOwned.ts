import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

const secretIsAppOwned = (secret: ListSecretResult) =>
  secret["owner-tag"].startsWith("application-");

export default secretIsAppOwned;
