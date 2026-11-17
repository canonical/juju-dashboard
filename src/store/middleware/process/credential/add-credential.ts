import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import getUserName from "utils/getUserName";
import { logger } from "utils/logger";

import { hasConnections } from "../../connection/util";
import { createProcess } from "../createProcess";

const REQUIRED_CONNECTIONS = ["wsControllerURL"];

export enum Label {
  MISSING_CONNECTION_ERROR = "connection not provided",
  NOT_AUTHENTICATED_ERROR = "not authenticated with controller",
  NO_CLOUD_FACADE_ERROR = "Cloud facade is not available on the connection",
}

export type Payload = {
  wsControllerURL: string;
  cloud: string;
  name: string;
  authType: string;
  attrs: Record<string, string>;
};

export type AddCredentialStatus = { status: "pending" };

export async function* addCredential(
  { cloud, name, authType, attrs }: Omit<Payload, "wsControllerURL">,
  connection: ConnectionWithFacades,
): AsyncGenerator<AddCredentialStatus, void, void> {
  const userTag = connection.info.user?.identity;
  if (!userTag) {
    throw new Error(Label.NOT_AUTHENTICATED_ERROR);
  }
  if (!connection.facades.cloud) {
    throw new Error(Label.NO_CLOUD_FACADE_ERROR);
  }
  const tag = `cloudcred-${cloud}_${getUserName(userTag)}_${name}`;
  const request = connection.facades.cloud.addCredentials({
    credentials: [{ tag, credential: { "auth-type": authType, attrs } }],
  });
  yield { status: "pending" };
  const response = await request;
  const error = response.results?.[0]?.error;
  if (error) {
    throw new Error(error.message);
  }
}

export default createProcess<Payload, AddCredentialStatus, void>(
  "credential/add-credential",
  async function* ({
    meta,
    cloud,
    name,
    authType,
    attrs,
  }): AsyncGenerator<AddCredentialStatus, void, void> {
    if (!hasConnections(meta, REQUIRED_CONNECTIONS)) {
      throw new Error(Label.MISSING_CONNECTION_ERROR);
    }
    const connection = meta.connections.wsControllerURL;
    return yield* addCredential(
      {
        cloud,
        name,
        authType,
        attrs,
      },
      connection,
    );
  },
  {
    setStatus: ({ cloud, name }, { status }) => {
      // The status isn't stored as it doesn't differ from the running state.
      logger.debug(`Adding credential "${name}" to ${cloud}: ${status}`);
    },
    setRunning: ({ cloud, name, wsControllerURL }, running) =>
      jujuActions.setAddCredentialRunning({
        wsControllerURL,
        cloud,
        name,
        running,
      }),
    setOutcome: ({ wsControllerURL, cloud, name }, outcome) => {
      if ("error" in outcome) {
        // Don't log the payload as it contains the credential secrets.
        logger.error("Unable to add credential", name, outcome.error);
      }
      // The outcome (success or failure) is handled by the UI.
      return jujuActions.setAddCredentialOutcome({
        wsControllerURL,
        cloud,
        name,
        outcome,
      });
    },
  },
  {
    addActionMeta: () => ({
      withConnection: true,
      connectionList: REQUIRED_CONNECTIONS,
    }),
  },
);
