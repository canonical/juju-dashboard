import { createPollingSource } from "data/pollingSource";
import type { VersionElem } from "juju/jimm/JIMMV4";
import { supportedJujuVersions } from "juju/jimm/api";
import { actions as jujuActions } from "store/juju";

import { hasConnections } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  VersionElem[],
  { wsControllerURL: string }
>(
  "jimm-supported-versions",
  ({ wsControllerURL: _, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    return createPollingSource(
      async () => {
        const response = await supportedJujuVersions(connection);
        return response.versions;
      },
      { interval: { minutes: 24 * 60 } },
    );
  },
  {
    setData: ({ wsControllerURL }, data) =>
      jujuActions.updateSupportedJujuVersions({
        wsControllerURL,
        update: { data },
      }),
    setError: ({ wsControllerURL }, error) =>
      jujuActions.updateSupportedJujuVersions({
        wsControllerURL,
        update: { error },
      }),
    setLoading: ({ wsControllerURL }, loading) => {
      return jujuActions.updateSupportedJujuVersions({
        wsControllerURL,
        update: { loading },
      });
    },
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
