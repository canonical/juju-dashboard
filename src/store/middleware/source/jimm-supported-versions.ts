import { createPollingSource } from "data/pollingSource";
import { supportedJujuVersions } from "juju/jimm/api";
import { actions as jujuActions } from "store/juju";

import { hasConnection } from "../connection/middleware";
import { createSourceMiddleware } from "../source-middleware";

/**
 * Information of a version supported by JIMM.
 */
export type SupportedVersion = {
  /**
   * Version string.
   */
  version: string;
  /**
   * Date of version release.
   */
  date: string;
  /**
   * URL to release information.
   */
  link: string;
};

export default createSourceMiddleware<
  SupportedVersion[],
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

        const versions = [];
        for (const version of response.versions) {
          versions.push({
            version: version.version,
            date: version.date,
            link: version["link-to-release"],
          });
        }
        return versions;
      },
      { interval: { minutes: 10 } },
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
