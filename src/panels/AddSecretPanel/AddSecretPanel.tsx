import {
  ActionButton,
  Button,
  Notification,
} from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef } from "react";

import Panel from "components/Panel";
import ScrollOnRender from "components/ScrollOnRender";
import { usePanelQueryParams } from "panels/hooks";

import Fields from "./Fields";
import { RotatePolicy, type FormFields } from "./types";

export enum TestId {
  PANEL = "add-secret-panel",
}

export enum Label {
  CANCEL = "Cancel",
  SUBMIT = "Add secret",
}

const AddSecretPanel = () => {
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
  }>({
    panel: null,
  });
  const [inlineError, setInlineError] = useState<string[] | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  return (
    <>
      {inlineError ? (
        <ScrollOnRender scrollArea={scrollArea?.current}>
          <Notification severity="negative">{inlineError}</Notification>
        </ScrollOnRender>
      ) : null}
      <Panel
        data-testid={TestId.PANEL}
        drawer={
          <>
            <Button onClick={handleRemovePanelQueryParams}>
              {Label.CANCEL}
            </Button>
            <ActionButton
              appearance="positive"
              disabled={saving}
              form={formId}
              loading={saving}
              type="submit"
            >
              {Label.SUBMIT}
            </ActionButton>
          </>
        }
        onRemovePanelQueryParams={handleRemovePanelQueryParams}
        ref={scrollArea}
        title="Add a secret"
        width="narrow"
      >
        <Formik<FormFields>
          initialValues={{
            content: "",
            description: "",
            expiryTime: "",
            isBase64: false,
            label: "",
            rotatePolicy: RotatePolicy.NEVER,
          }}
          onSubmit={(values) => {
            setSaving(true);
            setInlineError(null);
            handleRemovePanelQueryParams();
          }}
        >
          <Form id={formId}>
            <Fields />
          </Form>
        </Formik>
      </Panel>
    </>
  );
};

export default AddSecretPanel;
