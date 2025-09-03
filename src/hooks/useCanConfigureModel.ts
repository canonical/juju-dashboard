import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useModelStatus from "hooks/useModelStatus";
import { useCheckPermissions } from "juju/api-hooks";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import { getIsJuju, getControllerUserTag } from "store/general/selectors";
import { getActiveUser, getModelUUIDFromList } from "store/juju/selectors";
import { canAdministerModel } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

const useCheckJujuPermissions = (
  modelUUID?: string | null,
  enabled: boolean = false,
) => {
  const activeUser = useAppSelector((state) => getActiveUser(state, modelUUID));
  console.log("activeUser", activeUser);
  const modelStatusData = useModelStatus(modelUUID);
  console.log("modelStatusData?.info?.users", modelStatusData?.info?.users);
  return (
    enabled &&
    activeUser !== null &&
    !!activeUser &&
    canAdministerModel(activeUser, modelStatusData?.info?.users)
  );
};

const useCheckJIMMPermissions = (
  modelUUID?: string | null,
  enabled: boolean = false,
  cleanup: boolean = false,
) => {
  const controllerUser = useAppSelector(getControllerUserTag);
  const { permitted } = useCheckPermissions(
    enabled && controllerUser !== null && controllerUser && modelUUID !== null
      ? {
          object: controllerUser,
          relation: JIMMRelation.WRITER,
          target_object: `model-${modelUUID}`,
        }
      : null,
    cleanup,
  );
  return permitted;
};

export const useCanConfigureModelWithUUID = (
  cleanup?: boolean,
  modelUUID: string | null = null,
) => {
  const isJuju = useAppSelector(getIsJuju);
  const jujuPermissions = useCheckJujuPermissions(modelUUID, isJuju);
  const jimmPermissions = useCheckJIMMPermissions(modelUUID, !isJuju, cleanup);
  return isJuju ? jujuPermissions : jimmPermissions;
};

const useCanConfigureModel = (
  cleanup?: boolean,
  modelName: string | null = null,
  userName: string | null = null,
) => {
  const params = useParams<EntityDetailsRoute>();
  userName = userName ?? params.userName ?? null;
  modelName = modelName ?? params.modelName ?? null;
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  return useCanConfigureModelWithUUID(cleanup, modelUUID);
};

export default useCanConfigureModel;
