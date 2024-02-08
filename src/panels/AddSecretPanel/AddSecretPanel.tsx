import type {
  CreateSecretArg,
  StringResults,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { ActionButton, Button } from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";

import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useCreateSecrets, useListSecrets } from "juju/apiHooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
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

const schema = Yup.object().shape({
  pairs: Yup.array()
    .of(
      Yup.object().shape({
        key: Yup.string()
          .required("Required")
          .test(
            "is-file",
            "File uploads not supported.",
            (value) => !value.endsWith("#file"),
          ),
        value: Yup.string().required("Required"),
      }),
    )
    .required("Must have a key value pair.")
    .min(1, "Minimum of 1 pair."),
});

const AddSecretPanel = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
  }>({
    panel: null,
  });
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const createSecrets = useCreateSecrets(userName, modelName);
  const listSecrets = useListSecrets(userName, modelName);
  return (
    <>
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
        <>
          <PanelInlineErrors
            inlineErrors={[inlineError]}
            scrollArea={scrollArea.current}
          />
          <Formik<FormFields>
            initialValues={{
              description: "",
              expiryTime: "",
              label: "",
              pairs: [{ key: "", value: "", isBase64: false }],
              rotatePolicy: RotatePolicy.NEVER,
            }}
            onSubmit={(values) => {
              setSaving(true);
              setInlineError(null);
              const content = values.pairs.reduce<Record<string, string>>(
                (contents, pair) => {
                  // Encode the value unless the user has provided a string
                  // that is already encoded.
                  contents[pair.key] = pair.isBase64
                    ? pair.value
                    : btoa(pair.value);
                  return contents;
                },
                {},
              );
              createSecrets([
                {
                  content: {
                    data: content,
                  },
                  description: values.description,
                  "expire-time": values.expiryTime
                    ? new Date(values.expiryTime).toISOString()
                    : undefined,
                  "rotate-policy": values.rotatePolicy,
                  label: values.label || undefined,
                  // The type includes an UpsertSecretArg object due to a
                  // schema.json issue which should be rectified in the future,
                  // it also lists owner-tag as required though it is not.
                } as CreateSecretArg,
              ])
                .then((response: StringResults | string) => {
                  let error;
                  if (typeof response === "string") {
                    error = response;
                  } else if (Array.isArray(response.results)) {
                    error = response.results[0]?.error?.message;
                  }
                  if (error) {
                    setSaving(false);
                    setInlineError(error);
                    return;
                  }
                  listSecrets();
                  handleRemovePanelQueryParams();
                  return;
                })
                .catch((error) => {
                  setSaving(false);
                  if (typeof error === "string" || error instanceof Error) {
                    setInlineError(
                      error instanceof Error ? error.message : error,
                    );
                  }
                });
            }}
            validationSchema={schema}
          >
            <Form id={formId}>
              <Fields />
            </Form>
          </Formik>
        </>
      </Panel>
    </>
  );
};

export default AddSecretPanel;
