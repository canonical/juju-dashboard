import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import type { CredentialContentsState } from "store/juju/types";
import { extractCredentialName } from "store/juju/utils/models";
import { toSerializableSourceError } from "store/util";

import { hasConnections } from "../connection/util";
import { createSourceInstance } from "../source-middleware";

export const NOT_AUTHENTICATED_ERROR = "not authenticated with controller";
export const NO_CLOUD_FACADE =
  "Cloud facade is not available on the connection";

export async function getCredentialContents(
  connection: ConnectionWithFacades,
  credentialTags: string[],
): Promise<CredentialContentsState["contents"]> {
  if (!connection.info.user?.identity) {
    throw new Error(NOT_AUTHENTICATED_ERROR);
  }
  if (!connection.facades.cloud) {
    throw new Error(NO_CLOUD_FACADE);
  }

  const response = await connection.facades.cloud.credentialContents({
    credentials: credentialTags.map((tag) => {
      const { cloud, name } = extractCredentialName(tag);
      return { "cloud-name": cloud, "credential-name": name };
    }),
    "include-secrets": false,
  });

  // The results are in the same order as the requested credentials.
  return Object.fromEntries(
    credentialTags.map((tag, index) => [tag, response.results?.[index] ?? {}]),
  );
}

export default createSourceInstance<
  {
    wsControllerURL: string;
    credentialTags: string[];
  },
  CredentialContentsState["contents"]
>(
  "credential-contents",
  ({ meta, credentialTags }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(
      async () => getCredentialContents(connection, credentialTags),
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: (_args, data) =>
      jujuActions.updateCredentialContents({
        update: { data },
      }),
    setError: (_args, error) =>
      jujuActions.updateCredentialContents({
        update: { error: toSerializableSourceError(error) },
      }),
    setLoading: (_args, loading) =>
      jujuActions.updateCredentialContents({
        update: { loading },
      }),
  },
  {
    addActionMeta: () => ({ withConnection: true }),
  },
);
