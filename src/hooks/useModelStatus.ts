import { useParams } from "react-router";

import { useQueryParams } from "hooks/useQueryParams";
import { getModelUUID, getModelStatus } from "store/juju/selectors";
import { useAppSelector } from "store/store";

// Return model status data based on model name in URL
export default function useModelStatus() {
  let modelName: string | null | undefined;
  ({ modelName } = useParams());

  // if model name cannot be derived from URL params, fallback and check for
  // query string value.
  const queryParams = useQueryParams({
    model: null,
  });

  if (!modelName) {
    modelName = queryParams[0].model;
  }

  const modelUUID = useAppSelector((state) => getModelUUID(state, modelName));

  return useAppSelector((state) => getModelStatus(state, modelUUID));
}
