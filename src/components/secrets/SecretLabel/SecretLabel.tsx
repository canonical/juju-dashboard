import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import type { FC } from "react";

type Props = {
  secret: ListSecretResult;
};

const SecretLabel: FC<Props> = ({ secret }: Props) => {
  const id = secret.uri.replace(/^secret:/, "");
  return (
    <>
      {secret.label !== undefined ? (
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
