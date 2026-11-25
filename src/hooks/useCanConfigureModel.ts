import { useEffect } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useModelStatus from "hooks/useModelStatus";
import { useCheckPermissions } from "juju/api-hooks";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import {
  getIsJuju,
  getControllerUserTag,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getActiveUser, getModelUUIDFromList } from "store/juju/selectors";
import { canAdministerModel } from "store/juju/utils/models";
import { useAppDispatch, useAppSelector } from "store/store";

type CanConfigureStatus = {
  canConfigure: boolean;
  loaded: boolean;
};

const useCheckJujuPermissions = (
  modelUUID?: null | string,
  enabled: boolean = false,
): CanConfigureStatus => {
  const activeUser = useAppSelector((state) => getActiveUser(state, modelUUID));
  const modelStatusData = useModelStatus(modelUUID);
  return {
    canConfigure:
      enabled &&
      !!activeUser &&
      canAdministerModel(activeUser, modelStatusData?.info?.users),
    loaded: !!activeUser && !!modelStatusData?.info,
  };
};

const useCheckJIMMPermissions = (
  modelUUID?: null | string,
  enabled: boolean = false,
  cleanup: boolean = false,
): CanConfigureStatus => {
  const controllerUser = useAppSelector(getControllerUserTag);
  const { permitted, loaded } = useCheckPermissions(
    enabled && controllerUser && modelUUID
      ? {
          object: controllerUser,
          relation: JIMMRelation.WRITER,
          target_object: `model-${modelUUID}`,
        }
      : null,
    cleanup,
  );
  return { canConfigure: permitted, loaded };
};

export const useCanConfigureModelStatus = (
  cleanup?: boolean,
  modelUUID: null | string = null,
): CanConfigureStatus => {
  const isJuju = useAppSelector(getIsJuju);
  const jujuPermissions = useCheckJujuPermissions(modelUUID, isJuju);
  const jimmPermissions = useCheckJIMMPermissions(modelUUID, !isJuju, cleanup);
  return isJuju ? jujuPermissions : jimmPermissions;
};

export const useCanConfigureModelWithUUID = (
  cleanup?: boolean,
  modelUUID: null | string = null,
): boolean => useCanConfigureModelStatus(cleanup, modelUUID).canConfigure;

/**
  Store whether the user can configure the model, once the permission check
  has loaded, so that a pending check is not stored as "no access".
*/
export const useSyncModelCanConfigure = (modelUUID: string): boolean => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const { canConfigure, loaded } = useCanConfigureModelStatus(false, modelUUID);

  useEffect(() => {
    if (loaded && wsControllerURL) {
      dispatch(
        jujuActions.setModelCanConfigure({
          modelUUID,
          canConfigure,
          wsControllerURL,
        }),
      );
    }
  }, [dispatch, modelUUID, canConfigure, loaded, wsControllerURL]);

  return canConfigure;
};

const useCanConfigureModel = (
  cleanup?: boolean,
  modelName?: null | string,
  qualifier?: null | string,
): boolean => {
  const params = useParams<EntityDetailsRoute>();
  qualifier ||= params.qualifier;
  modelName ||= params.modelName;
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  return useCanConfigureModelWithUUID(cleanup, modelUUID);
};

export default useCanConfigureModel;
