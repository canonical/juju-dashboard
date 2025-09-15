import { usePrevious } from "@canonical/react-components";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import fastDeepEqual from "fast-deep-equal/es6";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { useCleanupOnUnmount } from "components/hooks";
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
  getReBACRelationshipsErrors,
  getReBACPermissionErrors,
} from "store/juju/selectors";
import type { ReBACAllowed } from "store/juju/types";
import { useAppSelector } from "store/store";

type PermittedResult = {
  permitted: boolean;
  loading: boolean;
  loaded: boolean;
};

export const useReBAC = <A, C>(
  fetchAction: ActionCreatorWithPayload<{ wsControllerURL: string } & A>,
  cleanupAction: ActionCreatorWithPayload<C>,
  loading: boolean,
  loaded: boolean,
  hasError: boolean,
  payload?: A | null,
  payloadCleanup?: C | null,
  cleanup: boolean = false,
): void => {
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const previousCleanup = usePrevious(payloadCleanup, true);
  const previousPayload = usePrevious(payload, true);
  // Check if it has changed using deepEqual so that it ignores changes if the
  // object has a new reference, but the values are the same.
  const payloadChanged = !fastDeepEqual(payload, previousPayload);

  useCleanupOnUnmount(cleanupAction, cleanup, payloadCleanup);

  useEffect(() => {
    if (
      // Don't fetch if the last call resulted in an error otherwise the hook will enter an infinite loop.
      !hasError &&
      // Only fetch it if it doesn't already exist in the store or if the
      // payload changes
      ((!loading && !loaded) || payloadChanged) &&
      wsControllerURL &&
      payload &&
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
    hasError,
  ]);

  // Clean up the store if the payload changes.
  useEffect(() => {
    if (cleanup && payloadChanged && previousCleanup) {
      dispatch(cleanupAction(previousCleanup));
    }
  }, [cleanup, cleanupAction, dispatch, payloadChanged, previousCleanup]);
};

export const useCheckPermissions = (
  tuple?: null | RelationshipTuple,
  cleanup?: boolean,
): PermittedResult => {
  const permitted = useAppSelector((state) => hasReBACPermission(state, tuple));
  const loaded = useAppSelector((state) =>
    getReBACPermissionLoaded(state, tuple),
  );
  const loading = useAppSelector((state) =>
    getReBACPermissionLoading(state, tuple),
  );
  const errors = useAppSelector((state) =>
    getReBACPermissionErrors(state, tuple),
  );
  useReBAC(
    jujuActions.checkRelation,
    jujuActions.removeCheckRelation,
    loading,
    loaded,
    !!errors?.length,
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

export const useIsJIMMAdmin = (cleanup?: boolean): PermittedResult => {
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

export const useAuditLogsPermitted = (cleanup?: boolean): PermittedResult => {
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
  tuples?: null | RelationshipTuple[],
  cleanup?: boolean,
): {
  loading: boolean;
  loaded: boolean;
  permissions: null | ReBACAllowed[];
} => {
  const loaded = useAppSelector((state) =>
    getReBACRelationshipsLoaded(state, requestId),
  );
  const loading = useAppSelector((state) =>
    getReBACRelationshipsLoading(state, requestId),
  );
  const errors = useAppSelector((state) =>
    getReBACRelationshipsErrors(state, requestId),
  );
  const permissions = useAppSelector((state) =>
    getReBACPermissions(state, tuples),
  );
  useReBAC(
    jujuActions.checkRelations,
    jujuActions.removeCheckRelations,
    loading,
    loaded,
    !!errors,
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
