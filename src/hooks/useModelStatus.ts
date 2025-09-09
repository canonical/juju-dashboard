import { useParams } from "react-router";

import { useQueryParams } from "hooks/useQueryParams";
import { getModelUUID, getModelStatus } from "store/juju/selectors";
import { useAppSelector } from "store/store";

// Return model status data based on model name in URL
export default function useModelStatus(modelUUID: string | null = null) {
  let modelName: string | null;
  ({ modelName = null } = useParams());

  // if model name cannot be derived from URL params, fallback and check for
  // query string value.
  const queryParams = useQueryParams({
    model: null,
  });

  if (modelName === null || !modelName) {
    modelName = queryParams[0].model;
  }

  const urlModelUUID = useAppSelector((state) =>
    getModelUUID(state, modelName),
  );

  return useAppSelector((state) =>
    getModelStatus(state, modelUUID ?? urlModelUUID),
  );
}
