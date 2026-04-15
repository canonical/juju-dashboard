import type { CloudsResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";

import { createPollingSource } from "data/pollingSource";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  CloudsResult["clouds"],
  { wsControllerURL: string }
>(
  "cloud-info",
  ({ wsControllerURL: _, meta }) => {
    return createPollingSource(
      async () => {
        if (!hasConnection(meta)) {
          throw new Error("connection not provided");
        }

        const { connection } = meta;

        if (!connection?.info.user?.identity) {
          throw new Error("not authenticated with controller");
        }

        const response = (await connection.facades.cloud?.clouds({})) ?? {};
        return response.clouds;
      },
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: (_, data) =>
      jujuActions.updateCloudInfo({
        update: { data },
      }),
    setError: (_, error) => jujuActions.updateCloudInfo({ update: { error } }),
    setLoading: (_, loading) =>
      jujuActions.updateCloudInfo({
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
