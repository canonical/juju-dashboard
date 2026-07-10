import { createPollingSource } from "data/pollingSource";
import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { toSerializableSourceError } from "store/util";

import { hasConnections } from "../connection/util";
import { createSourceInstance } from "../source-middleware";

import type { CategoryDefinition } from "./types";
import { generateCategoryDefinitions } from "./util";

export const NOT_AUTHENTICATED_ERROR = "not authenticated with controller";
export const NO_MODEL_MANAGER_FACADE =
  "ModelManager facade is not available on the connection";
export const NO_CLOUD_FACADE =
  "Cloud facade is not available on the connection";

export async function getModelConfigDefaults(
  connection: ConnectionWithFacades,
  cloudTag: string,
  providerType: string,
  selectedRegion?: string,
): Promise<CategoryDefinition[]> {
  if (!connection.facades.modelManager) {
    throw new Error(NO_MODEL_MANAGER_FACADE);
  }
  if (!connection.facades.cloud) {
    throw new Error(NO_CLOUD_FACADE);
  }

  // modelConfigSchema is only available on CloudV8 (Juju >= 4.0.12).
  // Skip both calls if the schema method is unavailable — the UI will fall
  // back to the static catalog. A follow-up PR will handle the defaults-only
  // path for older Juju versions.
  if (!("modelConfigSchema" in connection.facades.cloud)) {
    return [];
  }

  const [defaultsResult, schemaResult] = await Promise.allSettled([
    connection.facades.modelManager.modelDefaultsForClouds({
      entities: [{ tag: cloudTag }],
    }),
    connection.facades.cloud.modelConfigSchema({
      "provider-type": providerType,
    }),
  ]);

  if (
    defaultsResult.status === "rejected" &&
    schemaResult.status === "rejected"
  ) {
    throw new Error(
      `Failed to fetch model config defaults and schema: ${defaultsResult.reason}; ${schemaResult.reason}`,
    );
  }
  if (defaultsResult.status === "rejected") {
    throw new Error(
      `Failed to fetch model config defaults: ${defaultsResult.reason}`,
    );
  }
  if (schemaResult.status === "rejected") {
    throw new Error(
      `Failed to fetch model config schema: ${schemaResult.reason}`,
    );
  }

  return generateCategoryDefinitions(
    schemaResult.value.schema,
    defaultsResult.value.results[0]?.config,
    selectedRegion,
  );
}

export default createSourceInstance<
  {
    wsControllerURL: string;
    cloudTag: string;
    providerType: string;
    selectedRegion?: string;
  },
  CategoryDefinition[]
>(
  "model-config-defaults",
  ({ wsControllerURL: _, cloudTag, providerType, selectedRegion, meta }) => {
    if (!hasConnections(meta, ["wsControllerURL"])) {
      throw new Error("connection not provided");
    }

    const connection = meta.connections.wsControllerURL;

    if (!connection?.info.user?.identity) {
      throw new Error(NOT_AUTHENTICATED_ERROR);
    }

    return createPollingSource(
      async () =>
        getModelConfigDefaults(
          connection,
          cloudTag,
          providerType,
          selectedRegion,
        ),
      { interval: { seconds: 300 } },
    );
  },
  {
    setData: ({ providerType }, data) =>
      jujuActions.updateModelConfigDefaults({
        providerType,
        update: { data },
      }),
    setError: ({ providerType }, error) =>
      jujuActions.updateModelConfigDefaults({
        providerType,
        update: { error: toSerializableSourceError(error) },
      }),
    setLoading: ({ providerType }, loading) =>
      jujuActions.updateModelConfigDefaults({
        providerType,
        update: { loading },
      }),
  },
  {
    addActionMeta: (_payload) => ({ withConnection: true }),
  },
);
