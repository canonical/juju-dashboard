import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";

import { hasConnections } from "../../connection/util";
import { createProcess } from "../createProcess";

const REQUIRED_CONNECTIONS = ["wsControllerURL"];

export enum Label {
  NO_CLOUD_FACADE_ERROR = "Cloud facade is not available on the connection",
  MISSING_CONNECTION_ERROR = "connection not provided",
}

export type Payload = {
  wsControllerURL: string;
  credentialTag: string;
};

export type RemoveCredentialStatus = { status: "initiated" | "pending" };

export async function* runRemoveCredential(
  credentialTag: string,
  connection: ConnectionWithFacades,
): AsyncGenerator<RemoveCredentialStatus, void, void> {
  if (!connection.facades.cloud) {
    throw new Error(Label.NO_CLOUD_FACADE_ERROR);
  }
  const request = connection.facades.cloud.revokeCredentialsCheckModels({
    credentials: [{ tag: credentialTag, force: false }],
  });
  yield { status: "pending" };
  const result = await request;
  const error = result.results[0]?.error;
  if (error) {
    throw new Error(error.message);
  }
  yield { status: "initiated" };
}

export default createProcess<Payload, RemoveCredentialStatus, void>(
  "credential/remove-credential",
  async function* ({
    credentialTag,
    meta,
  }): AsyncGenerator<RemoveCredentialStatus, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error(Label.MISSING_CONNECTION_ERROR);
    }
    const connection = meta.connections.wsControllerURL;
    return yield* runRemoveCredential(credentialTag, connection);
  },
  {
    setStatus: (payload, status) =>
      jujuActions.setRemoveCredentialStatus({
        credentialTag: payload.credentialTag,
        status: status.status,
        wsControllerURL: payload.wsControllerURL,
      }),
    setRunning: (payload, running) =>
      jujuActions.setRemoveCredentialRunning({
        credentialTag: payload.credentialTag,
        running,
        wsControllerURL: payload.wsControllerURL,
      }),
    setOutcome: (payload, outcome) =>
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: payload.credentialTag,
        outcome,
        wsControllerURL: payload.wsControllerURL,
      }),
  },
  {
    addActionMeta: (_payload) => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
  },
);
