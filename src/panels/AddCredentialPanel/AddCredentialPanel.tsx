import { ActionButton, Button } from "@canonical/react-components";
import { Formik } from "formik";
import type { FC } from "react";
import { useId, useMemo, useState } from "react";

import FormikFormData from "components/FormikFormData";
import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import Fields from "./Fields/Fields";
import type { FormFields } from "./Fields/types";
import { Label, TestId } from "./types";
import { EMPTY_FORM_FIELDS, getValidationSchema } from "./utils";

const AddCredentialPanel: FC = () => {
  const formId = useId();
  const { clouds } = useAppSelector(getCloudInfoState);
  const validationSchema = useMemo(() => getValidationSchema(clouds), [clouds]);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
  }>({ panel: null });

  return (
    <Panel
      {...testId(TestId.PANEL)}
      drawer={
        <>
          <Button onClick={handleRemovePanelQueryParams}>{Label.CANCEL}</Button>
          <ActionButton
            appearance="positive"
            disabled={!isValid}
            form={formId}
            type="submit"
          >
            {Label.SUBMIT}
          </ActionButton>
        </>
      }
      className="add-credential-panel"
      contentClassName="u-no-padding"
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
      title={Label.TITLE}
      width="unset"
    >
      <Formik<FormFields>
        initialValues={EMPTY_FORM_FIELDS}
        validateOnMount
        validationSchema={validationSchema}
        // Submit will be handled later
        onSubmit={(_values) => {
          handleRemovePanelQueryParams();
        }}
      >
        <FormikFormData onValidate={setIsValid} id={formId}>
          <Fields />
        </FormikFormData>
      </Formik>
    </Panel>
  );
};

export default AddCredentialPanel;
