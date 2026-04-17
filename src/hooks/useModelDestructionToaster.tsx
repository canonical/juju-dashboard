import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getDestructionState, getModelList } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { externalURLs } from "urls";
import { toastNotification } from "utils/toastNotification";

export default function useModelDestructionToaster(): void {
  const destructionState = useAppSelector(getDestructionState);
  const modelsList = useAppSelector(getModelList);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const dispatch = useDispatch();

  useEffect(() => {
    // Iterate over all entries in the destruction state.
    Object.entries(destructionState).forEach(
      ([modelUUID, destructionStatus]) => {
        // Check if the destruction is in a loading state.
        if (destructionStatus.loading) {
          // Handle an initiated destruction
          toastNotification(
            <b>Destroying model "{destructionStatus.modelName}"...</b>,
            "information",
          );
        } else if (
          wsControllerURL &&
          destructionStatus.loaded &&
          destructionStatus.errors === null &&
          !Object.keys(modelsList).includes(modelUUID)
        ) {
          // Handle a successful destruction (model is no longer in modelsList)
          toastNotification(
            <b>Model "{destructionStatus.modelName}" destroyed successfully</b>,
            "positive",
          );

          // Dispatch the clear action to remove this entry from the state.
          dispatch(
            jujuActions.clearDestroyedModel({
              modelUUID,
              wsControllerURL,
            }),
          );
        }

        if (wsControllerURL && destructionStatus.errors) {
          // Handle a failed destruction
          toastNotification(
            <>
              <b>Destroying model "{destructionStatus.modelName}" failed</b>
              <div>
                Retry or consult{" "}
                <Link to={externalURLs.destroyModel} target="_blank">
                  documentation
                </Link>
              </div>
            </>,
            "negative",
          );

          // Dispatch the clear action to remove this entry from the state.
          dispatch(
            jujuActions.clearDestroyedModel({
              modelUUID,
              wsControllerURL,
            }),
          );
        }
      },
    );
  }, [wsControllerURL, modelsList, destructionState, dispatch]);
}
