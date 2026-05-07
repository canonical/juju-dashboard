import { useEffect, useRef } from "react";
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

  // Track shown toast IDs to prevent duplicates on re-renders
  const shownToastIds = useRef<string[]>([]);

  useEffect(() => {
    // Iterate over all entries in the destruction state.
    Object.entries(destructionState).forEach(
      ([modelUUID, destructionStatus]) => {
        // Check if the destruction is in a loading state.
        if (destructionStatus.loading) {
          // Handle an initiated destruction
          const toastId = `destroy-loading-${modelUUID}`;
          if (!shownToastIds.current.includes(toastId)) {
            toastNotification(
              <b>Destroying model "{destructionStatus.modelName}"...</b>,
              "information",
              toastId,
            );
            shownToastIds.current.push(toastId);
          }
        } else if (
          wsControllerURL &&
          destructionStatus.loaded &&
          destructionStatus.errors === null
        ) {
          // Handle a successful destruction (model is no longer in modelsList)
          const toastId = `destroy-success-${modelUUID}`;
          if (!shownToastIds.current.includes(toastId)) {
            toastNotification(
              <b>
                Model "{destructionStatus.modelName}" destroyed successfully
              </b>,
              "positive",
              toastId,
            );
            shownToastIds.current.push(toastId);
          }
          // Invalidate the model list to ensure we have the most up-to-date information.
          dispatch(modelListSource.actions.invalidate({ wsControllerURL }));

          // Dispatch the clear action to remove this entry from the state.
          dispatch(
            jujuActions.clearDestroyedModel({
              modelUUID,
              wsControllerURL,
            }),
          );
          // Remove the loading and success toasts from tracking for future cycles
          shownToastIds.current = shownToastIds.current.filter(
            (id) => id !== `destroy-loading-${modelUUID}` && id !== toastId,
          );
        }

        if (wsControllerURL && destructionStatus.errors) {
          // Handle a failed destruction
          const toastId = `destroy-error-${modelUUID}`;
          if (!shownToastIds.current.includes(toastId)) {
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
              toastId,
            );
            shownToastIds.current.push(toastId);
          }
          // Invalidate the model list to ensure we have the most up-to-date information.
          dispatch(modelListSource.actions.invalidate({ wsControllerURL }));

          // Dispatch the clear action to remove this entry from the state.
          dispatch(
            jujuActions.clearDestroyedModel({
              modelUUID,
              wsControllerURL,
            }),
          );
          // Remove the loading and error toasts from tracking for future cycles
          shownToastIds.current = shownToastIds.current.filter(
            (id) => id !== `destroy-loading-${modelUUID}` && id !== toastId,
          );
        }
      },
    );
  }, [wsControllerURL, destructionState, dispatch]);
}
