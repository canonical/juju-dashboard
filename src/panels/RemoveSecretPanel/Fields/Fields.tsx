import { Select, ConfirmationModal } from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";

import FormikField from "components/FormikField/FormikField";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { getSecretByURI, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import type { FormFields } from "../types";

export enum Label {
  CANCEL_BUTTON = "Cancel",
  CONFIRM_BUTTON = "Remove",
  CONFIRM_TITLE = "Remove secret?",
  REMOVE_ALL = "Remove all revisions",
  REVISION = "Revision",
}

type Props = {
  hideConfirm: () => void;
  handleRemoveSecret: (values: FormFields) => void;
  secretURI?: string | null;
  showConfirm: boolean;
};

const Fields = ({
  hideConfirm,
  handleRemoveSecret,
  secretURI,
  showConfirm,
}: Props): JSX.Element => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const { values } = useFormikContext<FormFields>();
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  const { Portal } = usePortal();

  return (
    <>
      <FormikField
        id={Label.REMOVE_ALL}
        label={Label.REMOVE_ALL}
        name="removeAll"
        type="checkbox"
        disabled={secret?.revisions.length === 1}
      />
      <FormikField
        label={Label.REVISION}
        name="revision"
        component={Select}
        disabled={values.removeAll}
        options={
          [...(secret?.revisions ?? [])].reverse().map(({ revision }) => ({
            label: `${revision}${revision === secret?.["latest-revision"] ? " (latest)" : ""}`,
            value: revision.toString(),
          })) ?? []
        }
      />
      {showConfirm ? (
        <Portal>
          <ConfirmationModal
            title={Label.CONFIRM_TITLE}
            cancelButtonLabel={Label.CANCEL_BUTTON}
            confirmButtonLabel={Label.CONFIRM_BUTTON}
            confirmButtonAppearance="negative"
            confirmExtra={
              <p className="u-text--muted p-text--small u-align--left">
                This action can't be undone.
              </p>
            }
            onConfirm={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
              // Stop propagation of the click event in order for the Panel
              // to remain open after an error occurs in executeAction().
              // Remove this manual fix once this issue gets resolved:
              // https://github.com/canonical/react-components/issues/1032
              event.nativeEvent.stopImmediatePropagation();
              handleRemoveSecret(values);
            }}
            close={hideConfirm}
          >
            <p>Are you sure you would like to remove this secret?</p>
          </ConfirmationModal>
        </Portal>
      ) : null}
    </>
  );
};

export default Fields;
