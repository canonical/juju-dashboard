import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getDestructionState } from "store/juju/selectors";
import modelListSource from "store/middleware/source/model-list";
import { useAppSelector } from "store/store";
import { externalURLs } from "urls";
import { toastNotification } from "utils/toastNotification";

export default function useModelDestructionToaster(): void {
  const destructionState = useAppSelector(getDestructionState);
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
            `destroy-loading-${modelUUID}`,
          );
        } else if (
          wsControllerURL &&
          destructionStatus.loaded &&
          destructionStatus.errors === null
        ) {
          // Handle a successful destruction (model is no longer in modelsList)
          toastNotification(
            <b>Model "{destructionStatus.modelName}" destroyed successfully</b>,
            "positive",
            `destroy-success-${modelUUID}`,
          );
          // Invalidate the model list to ensure we have the most up-to-date information.
          dispatch(modelListSource.actions.invalidate({ wsControllerURL }));

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
            `destroy-error-${modelUUID}`,
          );
          // Invalidate the model list to ensure we have the most up-to-date information.
          dispatch(modelListSource.actions.invalidate({ wsControllerURL }));

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
  }, [wsControllerURL, destructionState, dispatch]);
}
