import { ActionButton, Button } from "@canonical/react-components";
import { Formik } from "formik";
import type { FC } from "react";
import { useId, useState } from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";
import Panel from "components/Panel";
import { usePanelQueryParams } from "panels/hooks";
import { testId } from "testing/utils";

import Fields from "./Fields/Fields";
import type { FormFields } from "./Fields/types";
import { Label, TestId } from "./types";

const AddCredentialPanel: FC = () => {
  const formId = useId();
  const [isValid, setIsValid] = useState<boolean>(false);
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
  }>({
    panel: null,
  });

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
        initialValues={{
          name: "",
          cloud: "",
          region: "",
        }}
        validateOnMount
        // Submit will be handled later
        onSubmit={(_values) => {
          handleRemovePanelQueryParams();
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required("Required"),
          cloud: Yup.string().required("Required"),
        })}
      >
        <FormikFormData onValidate={setIsValid} id={formId}>
          <Fields />
        </FormikFormData>
      </Formik>
    </Panel>
  );
};

export default AddCredentialPanel;
