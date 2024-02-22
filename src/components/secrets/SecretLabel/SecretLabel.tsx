import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";

type Props = {
  secret: ListSecretResult;
};

const SecretLabel = ({ secret }: Props) => {
  const id = secret.uri.replace(/^secret:/, "");
  return (
    <>
      {secret.label ? (
        <>
          {secret.label} <span className="u-text--muted">({id})</span>
        </>
      ) : (
        id
      )}
    </>
  );
};

export default SecretLabel;
