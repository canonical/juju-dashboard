import { usePrevious } from "@canonical/react-components";
import type { ActionCreatorWithPayload, PayloadAction } from "@reduxjs/toolkit";
import fastDeepEqual from "fast-deep-equal/es6";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams, useOutletContext, useMatch } from "react-router";

import type {
  EntityDetailsRoute,
  ModelAppRoute,
  ModelIndexRoute,
} from "components/Routes";
import type { BaseLayoutContext } from "layout/BaseLayout";
import type { StatusView } from "layout/Status";
import { getModelByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import type { Nullable } from "types";
import urls from "urls";
import getUserName from "utils/getUserName";

type NameProps = {
  modelName: string;
  qualifier?: null | string;
  uuid?: never;
};

type UUIDProps = {
  modelName?: never;
  qualifier?: never;
  uuid: string;
};

type ModelByUUIDDetailsProps = NameProps | UUIDProps;

export const useEntityDetailsParams = (): {
  isNestedEntityPage: boolean;
} & Nullable<EntityDetailsRoute> => {
  const {
    qualifier = null,
    modelName = null,
    appName = null,
    unitId = null,
    machineId = null,
  } = useParams<EntityDetailsRoute>();
  return {
    appName,
    isNestedEntityPage: !!appName || !!unitId || !!machineId,
    machineId,
    modelName,
    unitId,
    qualifier,
  };
};

export const useModelIndexParams = (): Partial<ModelIndexRoute> => {
  return useMatch(urls.model.index(null))?.params ?? {};
};

export const useModelAppParams = (): Partial<ModelAppRoute> => {
  return useMatch(urls.model.app.index(null))?.params ?? {};
};

export const useModelByUUIDDetails = ({
  uuid,
  qualifier,
  modelName,
}: ModelByUUIDDetailsProps): {
  modelName?: null | string;
  qualifier: null | string;
} => {
  const modelDetails = useAppSelector((state) => getModelByUUID(state, uuid));
  const owner = uuid ? modelDetails?.qualifier : qualifier;
  const model = uuid ? modelDetails?.name : modelName;
  return {
    modelName: model,
    qualifier: owner ? getUserName(owner) : null,
  };
};

export const useStatusView = (statusView: StatusView): void => {
  const { setStatus } = useOutletContext<BaseLayoutContext>();

  useEffect(() => {
    setStatus(statusView);
    return (): void => {
      // Hide the view when navigating away from this component.
      setStatus(null);
    };
  }, [setStatus, statusView]);
};

// Dispatch a cleanup action when a component unmounts.
export const useCleanupOnUnmount = <P>(
  cleanupAction: ActionCreatorWithPayload<P>,
  cleanupEnabled: boolean = false,
  payload: null | P = null,
): void => {
  const dispatch = useDispatch();
  const cleanupPayload = useRef<(() => void) | null>(null);
  const previousCleanup = usePrevious(cleanupAction, true);
  const previousPayload = usePrevious(payload, false);
  // Check if it has changed using deepEqual so that it ignores changes if the
  // objects have a new reference, but the values are the same.
  const cleanupChanged = !fastDeepEqual(cleanupAction, previousCleanup);
  const payloadChanged = !fastDeepEqual(payload, previousPayload);

  // Store the cleanup action in a ref, this is required otherwise the cleanup
  // action will get called whenever any of the args change instead of when the
  // component is unmounted.
  useEffect(() => {
    if (cleanupEnabled && payload && (cleanupChanged || payloadChanged)) {
      cleanupPayload.current = (): PayloadAction<P> =>
        dispatch(cleanupAction(payload));
    }
  }, [
    cleanupEnabled,
    cleanupAction,
    dispatch,
    payload,
    cleanupChanged,
    payloadChanged,
  ]);

  // Clean up the store when the component that is using the hook gets unmounted.
  useEffect(
    () => (): void => {
      cleanupPayload.current?.();
    },
    [],
  );
};
