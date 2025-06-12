import { usePrevious } from "@canonical/react-components";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import fastDeepEqual from "fast-deep-equal/es6";
import { useEffect, useRef } from "react";
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
  getReBACRelationshipsLoaded,
  getReBACRelationshipsLoading,
  getReBACPermissions,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

export const useReBAC = <A, C>(
  fetchAction: ActionCreatorWithPayload<A & { wsControllerURL: string }>,
  cleanupAction: ActionCreatorWithPayload<C>,
  loading: boolean,
  loaded: boolean,
  payload?: A | null,
  payloadCleanup?: C | null,
  cleanup?: boolean,
) => {
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const previousPayload = usePrevious(payload, false);
  const payloadChanged = !fastDeepEqual(payload, previousPayload);

  useEffect(() => {
    if (
      // Only fetch it if it doesn't already exist in the store.
      !loading &&
      !loaded &&
      wsControllerURL &&
      payload &&
      // Ignore changes if the object has a new reference, but the values are
      // the same.
      payloadChanged &&
      // Only check the relation if the controller supports rebac.
      rebacEnabled
    ) {
      dispatch(fetchAction({ ...payload, wsControllerURL }));
    }
  }, [
    dispatch,
    loaded,
    loading,
    rebacEnabled,
    payload,
    wsControllerURL,
    payloadChanged,
    fetchAction,
  ]);

  // Clean up the store if the payload changes.
  useEffect(() => {
    if (cleanup && payloadChanged && payloadCleanup) {
      dispatch(cleanupAction(payloadCleanup));
    }
  }, [cleanup, cleanupAction, dispatch, payloadChanged, payloadCleanup]);

  const cleanupPayload = useRef<(() => void) | null>(null);

  // Store the cleanup action in a ref, this is required otherwise the cleanup
  // action will get called whenever any of the args change instead of when the
  // component is unmounted.
  useEffect(() => {
    if (cleanup && payloadChanged && payloadCleanup) {
      cleanupPayload.current = () => dispatch(cleanupAction(payloadCleanup));
    }
  }, [
    cleanup,
    cleanupAction,
    dispatch,
    payload,
    payloadChanged,
    payloadCleanup,
  ]);

  // Clean up the store when the component that is using the hook gets unmounted.
  useEffect(
    () => () => {
      cleanupPayload.current?.();
    },
    [],
  );
};

export const useCheckPermissions = (
  tuple?: RelationshipTuple | null,
  cleanup?: boolean,
) => {
  const permitted = useAppSelector((state) => hasReBACPermission(state, tuple));
  const loaded = useAppSelector((state) =>
    getReBACPermissionLoaded(state, tuple),
  );
  const loading = useAppSelector((state) =>
    getReBACPermissionLoading(state, tuple),
  );
  useReBAC(
    jujuActions.checkRelation,
    jujuActions.removeCheckRelation,
    loading,
    loaded,
    tuple ? { tuple } : null,
    tuple ? { tuple } : null,
    cleanup,
  );

  return {
    permitted,
    loading,
    loaded,
  };
};

export const useIsJIMMAdmin = (cleanup?: boolean) => {
  const activeUser = useAppSelector(getControllerUserTag);
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
  const activeUser = useAppSelector(getControllerUserTag);
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

export const useCheckRelations = (
  requestId: string,
  tuples?: RelationshipTuple[] | null,
  cleanup?: boolean,
) => {
  const loaded = useAppSelector((state) =>
    getReBACRelationshipsLoaded(state, requestId),
  );
  const loading = useAppSelector((state) =>
    getReBACRelationshipsLoading(state, requestId),
  );
  const permissions = useAppSelector((state) =>
    getReBACPermissions(state, tuples),
  );
  useReBAC(
    jujuActions.checkRelations,
    jujuActions.removeCheckRelations,
    loading,
    loaded,
    tuples ? { requestId, tuples } : null,
    { requestId },
    cleanup,
  );

  return {
    loading,
    loaded,
    permissions,
  };
};
