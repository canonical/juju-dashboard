import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getModelUUID, getModelStatus } from "store/juju/selectors";
import { useQueryParams, StringParam } from "use-query-params";
import { useAppSelector } from "store/store";

// Return model status data based on model name in URL
export default function useModelStatus() {
  let modelName: string | null | undefined;
  ({ modelName } = useParams());

  // if model name cannot be derived from URL params, fallback and check for
  // query string value.
  const queryParams = useQueryParams({
    model: StringParam,
  });

  if (!modelName) {
    modelName = queryParams[0].model;
  }

  const getModelUUIDMemo = useMemo(
    () => (modelName ? getModelUUID(modelName) : null),
    [modelName]
  );
  const modelUUID = useAppSelector((state) => getModelUUIDMemo?.(state));
  const getModelStatusMemo = useMemo(
    () => getModelStatus(modelUUID),
    [modelUUID]
  );

  return useAppSelector((state) => getModelStatusMemo?.(state));
}
