import type { CloudsResult } from "@canonical/jujulib/dist/api/facades/cloud/CloudV7";
import { useCallback } from "react";

import type { ConnectionWithFacades } from "juju/types";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector, useAppDispatch } from "store/store";

import { useCallWithControllerConnection } from "./common";

export enum Label {
  NO_CLOUD_ACCESS = "User does not have access to clouds",
}

export const useListCloudInfo = (
  qualifier: string,
): ((qualifier: string) => void) => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const onError = useCallback(
    (error: string) => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.setCloudInfoErrors({
            qualifier,
            errors: error,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, qualifier, wsControllerURL],
  );
  const onSuccess = useCallback(
    (response: CloudsResult) => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.updateCloudInfo({
            qualifier,
            cloudInfo: response.clouds ?? undefined,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, qualifier, wsControllerURL],
  );
  const handler = useCallback(
    async (connection: ConnectionWithFacades, _qualifier: string) => {
      if (!connection.facades.cloud) {
        throw new Error(Label.NO_CLOUD_ACCESS);
      }
      if (wsControllerURL) {
        dispatch(jujuActions.cloudInfoLoading({ qualifier, wsControllerURL }));
      }
      return connection.facades.cloud.clouds({
        "user-tag": qualifier,
      } as CloudsResult);
    },
    [dispatch, qualifier, wsControllerURL],
  );
  return useCallWithControllerConnection(handler, onSuccess, onError);
};
