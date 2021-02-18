import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getModelUUID,
  getModelStatus,
  validateModelNameFromURL,
} from "app/selectors";
import { useSelector } from "react-redux";

// Return model status data based on model name in URL
export default function useModelStatus() {
  let { userName, modelName } = useParams();

  modelName = validateModelNameFromURL(userName, modelName);
  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID,
  ]);

  return useSelector(getModelStatusMemo);
}
