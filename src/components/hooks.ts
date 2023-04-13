import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";

export const useEntityDetailsParams = () => {
  const { userName, modelName, appName, unitId, machineId } =
    useParams<EntityDetailsRoute>();
  return {
    appName,
    isNestedEntityPage: !!appName || !!unitId || !!machineId,
    machineId,
    modelName,
    unitId,
    userName,
  };
};
