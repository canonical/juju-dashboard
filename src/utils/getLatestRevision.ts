import type {
  ListSecretResult,
  SecretRevision,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

const getLatestRevision = (secret?: ListSecretResult | null): null | number => {
  if (!secret || !secret.revisions.length) {
    return null;
  }
  return secret.revisions.reduce(
    (result: number, { revision }: SecretRevision) =>
      Math.max(revision, result),
    -1,
  );
};

export default getLatestRevision;
