import { useEffect } from "react";
import reactHotToast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link } from "react-router";

import ToastCard, { type ToastInstance } from "components/ToastCard";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getModelByUUID, getModelList } from "store/juju/selectors";
import type { DestroyModelState } from "store/juju/types";
import { useAppSelector } from "store/store";
import { externalURLs } from "urls";

type Props = {
  modelUUID: string;
  destructionStatus: DestroyModelState;
};

export default function ModelDestructionToaster({
  modelUUID,
  destructionStatus,
}: Props): null {
  const modelsList = useAppSelector(getModelList);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const modelName = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.name;
  const modelReference = modelName ? ` "${modelName}"` : "";
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if the destruction is in a loading state.
    if (destructionStatus.loading) {
      // Handle an initiated destruction
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard type="info" toastInstance={toast}>
          <b>Destroying model{modelReference}...</b>
        </ToastCard>
      ));
    } else if (
      wsControllerURL &&
      destructionStatus.loaded &&
      destructionStatus.errors === null &&
      !Object.keys(modelsList).includes(modelUUID)
    ) {
      // Handle a successful destruction (model is no longer in modelsList)
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard type="positive" toastInstance={toast}>
          <b>Model{modelReference} destroyed successfully</b>
        </ToastCard>
      ));

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
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard type="negative" toastInstance={toast}>
          <b>Destroying model{modelReference} failed</b>
          <div>
            Retry or consult{" "}
            <Link to={externalURLs.destroyModel} target="_blank">
              documentation
            </Link>
          </div>
        </ToastCard>
      ));

      // Dispatch the clear action to remove this entry from the state.
      dispatch(
        jujuActions.clearDestroyedModel({
          modelUUID,
          wsControllerURL,
        }),
      );
    }
  }, [
    wsControllerURL,
    modelsList,
    modelUUID,
    modelReference,
    destructionStatus,
    dispatch,
  ]);

  return null;
}
