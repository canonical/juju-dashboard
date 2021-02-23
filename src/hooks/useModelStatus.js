import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { getModelUUID, getModelStatus } from "app/selectors";
import { useSelector } from "react-redux";

// Return model status data based on model name in URL
export default function useModelStatus() {
  const { modelName } = useParams();
  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID,
  ]);

  return useSelector(getModelStatusMemo);
}
