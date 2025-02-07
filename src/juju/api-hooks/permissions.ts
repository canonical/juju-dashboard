import { useEffect } from "react";
import { useDispatch } from "react-redux";

import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import {
  getWSControllerURL,
  isReBACEnabled,
  isAuditLogsEnabled,
} from "store/general/selectors";
import { getControllerUserTag } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getReBACPermissionLoaded,
  getReBACPermissionLoading,
  hasReBACPermission,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

export const useCheckPermissions = (
  tuple?: RelationshipTuple | null,
  cleanup?: boolean,
) => {
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const permitted = useAppSelector((state) => hasReBACPermission(state, tuple));
  const loaded = useAppSelector((state) =>
    getReBACPermissionLoaded(state, tuple),
  );
  const loading = useAppSelector((state) =>
    getReBACPermissionLoading(state, tuple),
  );
  const rebacEnabled = useAppSelector(isReBACEnabled);

  useEffect(() => {
    if (
      // Only fetch it if it doesn't already exist in the store.
      !loading &&
      !loaded &&
      wsControllerURL &&
      tuple &&
      // Only check the relation if the controller supports rebac.
      rebacEnabled
    ) {
      dispatch(
        jujuActions.checkRelation({
          tuple,
          wsControllerURL,
        }),
      );
    }
  }, [dispatch, loaded, loading, rebacEnabled, tuple, wsControllerURL]);

  useEffect(
    () => () => {
      if (tuple && cleanup) {
        dispatch(
          jujuActions.removeCheckRelation({
            tuple,
          }),
        );
      }
    },
    [cleanup, dispatch, tuple],
  );

  return {
    permitted,
    loading,
    loaded,
  };
};

export const useIsJIMMAdmin = (cleanup?: boolean) => {
  const activeUser = useAppSelector((state) => getControllerUserTag(state));
  return useCheckPermissions(
    activeUser
      ? {
          object: activeUser,
          relation: JIMMRelation.ADMINISTRATOR,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        }
      : null,
    cleanup,
  );
};

export const useAuditLogsPermitted = (cleanup?: boolean) => {
  const activeUser = useAppSelector((state) => getControllerUserTag(state));
  const auditLogsEnabled = useAppSelector(isAuditLogsEnabled);
  const jimmAdminPermissions = useIsJIMMAdmin(cleanup);
  const auditLogPermissions = useCheckPermissions(
    activeUser && auditLogsEnabled
      ? {
          object: activeUser,
          relation: JIMMRelation.AUDIT_LOG_VIEWER,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        }
      : null,
    cleanup,
  );
  return {
    loading: auditLogPermissions.loading || jimmAdminPermissions.loading,
    loaded: auditLogPermissions.loaded || jimmAdminPermissions.loaded,
    permitted:
      auditLogsEnabled &&
      auditLogPermissions.permitted &&
      jimmAdminPermissions.permitted,
  };
};
