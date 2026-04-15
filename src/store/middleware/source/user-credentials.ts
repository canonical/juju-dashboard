import { createPollingSource } from "data/pollingSource";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

export default createSourceMiddleware<
  string[],
  { wsControllerURL: string; cloudTag: string }
>(
  "user-credentials",
  ({ wsControllerURL: _, cloudTag, meta }) => {
    return createPollingSource(
      async () => {
        if (!hasConnection(meta)) {
          throw new Error("connection not provided");
        }

        const { connection } = meta;

        if (!connection?.info.user?.identity) {
          throw new Error("not authenticated with controller");
        }

        const response = (await connection.facades.cloud?.userCredentials({
          "user-clouds": [
            {
              "cloud-tag": cloudTag,
              "user-tag": connection.info.user.identity,
            },
          ],
        })) ?? { results: [{ result: [] }] };
        return response.results[0].result ?? [];
      },
      { interval: { seconds: 30 } },
    );
  },
  {
    setData: ({ cloudTag }, data) =>
      jujuActions.updateUserCredentials({
        cloudTag,
        update: { data: { [cloudTag]: data } },
      }),
    setError: ({ cloudTag }, error) =>
      jujuActions.updateUserCredentials({ cloudTag, update: { error } }),
    setLoading: ({ cloudTag }, loading) =>
      jujuActions.updateUserCredentials({
        cloudTag,
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
