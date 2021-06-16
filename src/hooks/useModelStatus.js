import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getModelUUID, getModelStatus } from "app/selectors";
import { useSelector } from "react-redux";
import { useQueryParams, StringParam } from "use-query-params";

// Return model status data based on model name in URL
export default function useModelStatus() {
  let { modelName } = useParams();

  // if model name cannot be derived from URL params, fallback and check for
  // query string value.
  const queryParams = useQueryParams({
    model: StringParam,
  });

  if (!modelName) {
    modelName = queryParams[0].model;
  }

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(
    () => getModelStatus(modelUUID),
    [modelUUID]
  );

  return useSelector(getModelStatusMemo);
}
