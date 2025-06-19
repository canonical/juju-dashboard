import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useModelStatus from "hooks/useModelStatus";
import { useCheckPermissions } from "juju/api-hooks";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import { getIsJuju, getControllerUserTag } from "store/general/selectors";
import { getActiveUser, getModelUUIDFromList } from "store/juju/selectors";
import { canAdministerModel } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

const useCheckJujuPermissions = (modelUUID: string, enabled?: boolean) => {
  const activeUser = useAppSelector((state) => getActiveUser(state, modelUUID));
  const modelStatusData = useModelStatus(modelUUID);
  return (
    enabled &&
    !!activeUser &&
    canAdministerModel(activeUser, modelStatusData?.info?.users)
  );
};

const useCheckJIMMPermissions = (
  modelUUID: string,
  enabled?: boolean,
  cleanup?: boolean,
) => {
  const controllerUser = useAppSelector(getControllerUserTag);
  const { permitted } = useCheckPermissions(
    enabled && controllerUser && modelUUID
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

const useCanConfigureModel = (
  cleanup?: boolean,
  modelName?: string | null,
  userName?: string | null,
) => {
  const isJuju = useAppSelector(getIsJuju);
  const params = useParams<EntityDetailsRoute>();
  userName = userName || params.userName;
  modelName = modelName || params.modelName;
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const jujuPermissions = useCheckJujuPermissions(modelUUID, isJuju);
  const jimmPermissions = useCheckJIMMPermissions(modelUUID, !isJuju, cleanup);
  return isJuju ? jujuPermissions : jimmPermissions;
};

export default useCanConfigureModel;
