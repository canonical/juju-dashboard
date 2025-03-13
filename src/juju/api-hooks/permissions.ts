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
  getReBACRelationshipsRelations,
  getReBACRelationshipsLoaded,
  getReBACRelationshipsLoading,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

export const useReBAC = <T extends Partial<RelationshipTuple>>(
  fetchAction: ActionCreatorWithPayload<{ tuple: T; wsControllerURL: string }>,
  cleanupAction: ActionCreatorWithPayload<{ tuple: T }>,
  loading: boolean,
  loaded: boolean,
  tuple?: T | null,
  cleanup?: boolean,
) => {
  const dispatch = useDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const rebacEnabled = useAppSelector(isReBACEnabled);
  const previousTuple = usePrevious(tuple, false);
  const tupleChanged = !fastDeepEqual(tuple, previousTuple);

  useEffect(() => {
    if (
      // Only fetch it if it doesn't already exist in the store.
      !loading &&
      !loaded &&
      wsControllerURL &&
      tuple &&
      // Ignore changes if the object has a new reference, but the values are
      // the same.
      tupleChanged &&
      // Only check the relation if the controller supports rebac.
      rebacEnabled
    ) {
      dispatch(fetchAction({ tuple, wsControllerURL }));
    }
  }, [
    dispatch,
    loaded,
    loading,
    rebacEnabled,
    tuple,
    wsControllerURL,
    tupleChanged,
    fetchAction,
  ]);

  // Clean up the store if the tuple changes.
  useEffect(() => {
    if (cleanup && tupleChanged && previousTuple) {
      dispatch(cleanupAction({ tuple: previousTuple }));
    }
  }, [cleanup, cleanupAction, dispatch, previousTuple, tupleChanged]);

  const cleanupTuple = useRef<(() => void) | null>(null);

  // Store the cleanup action in a ref, this is required otherwise the cleanup
  // action will get called whenever any of the args change instead of when the
  // component is unmounted.
  useEffect(() => {
    if (cleanup && tupleChanged && tuple) {
      cleanupTuple.current = () => dispatch(cleanupAction({ tuple }));
    }
  }, [cleanup, cleanupAction, dispatch, tuple, tupleChanged]);

  // Clean up the store when the component that is using the hook gets unmounted.
  useEffect(
    () => () => {
      cleanupTuple.current?.();
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
    tuple,
    cleanup,
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

export const useGetRelationships = (
  tuple?: Partial<RelationshipTuple> | null,
  cleanup?: boolean,
) => {
  const relationships = useAppSelector((state) =>
    getReBACRelationshipsRelations(state, tuple),
  );
  const loaded = useAppSelector((state) =>
    getReBACRelationshipsLoaded(state, tuple),
  );
  const loading = useAppSelector((state) =>
    getReBACRelationshipsLoading(state, tuple),
  );
  useReBAC(
    jujuActions.listRelationshipTuples,
    jujuActions.removeListRelationshipTuples,
    loading,
    loaded,
    tuple,
    cleanup,
  );

  return {
    relationships: loaded && !relationships?.length ? null : relationships,
    loading,
    loaded,
  };
};
