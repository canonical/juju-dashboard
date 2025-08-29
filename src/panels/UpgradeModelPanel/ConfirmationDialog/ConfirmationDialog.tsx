import { ConfirmationModal, usePortal } from "@canonical/react-components";
import type { JSX } from "react";
import { useDispatch } from "react-redux";

import type { ConfirmTypes } from "panels/types";
import { ConfirmType } from "panels/types";
import { getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppSelector } from "store/store";

import { Label } from "./types";

type Props = {
  confirmType: ConfirmTypes;
  selectedController: string;
  modelUUID: string;
  setConfirmType: React.Dispatch<React.SetStateAction<ConfirmTypes>>;
  handleRemovePanelQueryParams: () => void;
};

const ConfirmationDialog = ({
  confirmType,
  selectedController,
  modelUUID,
  setConfirmType,
  handleRemovePanelQueryParams,
}: Props): JSX.Element | null => {
  const { Portal } = usePortal();
  const wsControllerURL = useAppSelector(getWSControllerURL) ?? "";
  const dispatch = useDispatch();

  if (confirmType === ConfirmType.SUBMIT) {
    // Render the submit confirmation modal.
    return (
      <Portal>
        <ConfirmationModal
          title={`Migrate to ${selectedController}?`}
          cancelButtonLabel={Label.CANCEL_BUTTON}
          confirmButtonLabel={Label.CONFIRM_BUTTON}
          confirmButtonAppearance="positive"
          onConfirm={() => {
            if (modelUUID) {
              dispatch(
                jujuActions.migrateModel({
                  modelUUID,
                  targetController: selectedController,
                  wsControllerURL,
                }),
              );
            }
            setConfirmType(null);
            handleRemovePanelQueryParams();
          }}
          close={() => {
            setConfirmType(null);
          }}
        >
          {`Would you like to migrate your model to the ${selectedController} controller?`}
        </ConfirmationModal>
      </Portal>
    );
  }
  return null;
};

export default ConfirmationDialog;
