import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { getModelByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import getUserName from "utils/getUserName";

type NameProps = {
  modelName: string;
  ownerTag?: string | null;
  uuid?: never;
};

type UUIDProps = {
  modelName?: never;
  ownerTag?: never;
  uuid: string;
};

export type ModelByUUIDDetailsProps = NameProps | UUIDProps;

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
}: ModelByUUIDDetailsProps) => {
  const modelDetails = useAppSelector((state) => getModelByUUID(state, uuid));
  const owner = uuid ? modelDetails?.ownerTag : ownerTag;
  const model = uuid ? modelDetails?.name : modelName;
  const userName = typeof owner === "string" ? getUserName(owner) : null;
  return { modelName: model, userName };
};
