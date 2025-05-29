import { useEffect } from "react";
import { useParams, useOutletContext } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import type { BaseLayoutContext } from "layout/BaseLayout";
import type { StatusView } from "layout/Status";
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

type ModelByUUIDDetailsProps = NameProps | UUIDProps;

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

export const useStatusView = (statusView: StatusView) => {
  const { setStatus } = useOutletContext<BaseLayoutContext>();

  useEffect(() => {
    setStatus(statusView);
    return () => {
      // Hide the view when navigating away from this component.
      setStatus(null);
    };
  }, [setStatus, statusView]);
};
