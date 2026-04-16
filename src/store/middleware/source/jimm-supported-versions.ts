import { createPollingSource } from "data/pollingSource";
import type { VersionElem } from "juju/jimm/JIMMV4";
import { supportedJujuVersions } from "juju/jimm/api";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  VersionElem[],
  { wsControllerURL: string }
>(
  "jimm-supported-versions",
  ({ wsControllerURL: _, meta }) => {
    if (!hasConnection(meta)) {
      throw new Error("connection not provided");
    }

    const { connection } = meta;

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
