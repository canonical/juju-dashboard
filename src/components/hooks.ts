import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { getModelByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";

type UseModelDetailsProps = {
  uuid: string;
  ownerTag?: string | null;
  modelName?: string;
};

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

export const useModelByUUIDDetails = ({
  uuid,
  ownerTag,
  modelName,
}: UseModelDetailsProps) => {
  const modelDetails = useAppSelector((state) => getModelByUUID(state, uuid));
  const owner = uuid ? modelDetails?.ownerTag : ownerTag;
  const model = uuid ? modelDetails?.name : modelName;
  const userName =
    typeof owner === "string" ? owner.replace("user-", "") : null;
  return { modelName: model, userName };
};
