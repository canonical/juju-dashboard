import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { ActionButton, Button, Spinner } from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useRemoveSecrets, useListSecrets } from "juju/apiHooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import { getSecretByURI, getModelUUIDFromList } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import Fields from "./Fields";
import { type FormFields } from "./types";

export enum TestId {
  PANEL = "remove-secret-panel",
}

export enum Label {
  CANCEL = "Cancel",
  SUBMIT = "Remove secret",
}

const RemoveSecretPanel = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [queryParams, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: string | null;
    secret: string | null;
  }>({
    panel: null,
    secret: null,
  });
  const secretURI = queryParams.secret;
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const removeSecrets = useRemoveSecrets(userName, modelName);
  const listSecrets = useListSecrets(userName, modelName);

  const handleRemoveSecret = useCallback(
    (values: FormFields) => {
      if (!secretURI) {
        // An error is displayed instead of the form if the secretURI doesn't
        // exist so it's not possible to get to this point.
        return;
      }
      setSaving(true);
      setInlineError(null);
      setShowConfirm(false);
      removeSecrets([
        {
          revisions: values.removeAll ? undefined : [Number(values.revision)],
          uri: secretURI,
        },
      ])
        .then((response: ErrorResults | string) => {
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
            setInlineError(error instanceof Error ? error.message : error);
          }
        });
    },
    [handleRemovePanelQueryParams, listSecrets, removeSecrets, secretURI],
  );

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
        title="Remove secret"
        width="narrow"
      >
        <>
          <PanelInlineErrors
            inlineErrors={[inlineError]}
            scrollArea={scrollArea.current}
          />
          {secret ? (
            <Formik<FormFields>
              initialValues={{
                removeAll: false,
                revision: secret["latest-revision"].toString(),
              }}
              onSubmit={(values) => {
                setShowConfirm(true);
              }}
            >
              <Form id={formId}>
                <Fields
                  handleRemoveSecret={handleRemoveSecret}
                  hideConfirm={() => setShowConfirm(false)}
                  secretURI={secretURI}
                  showConfirm={showConfirm}
                />
              </Form>
            </Formik>
          ) : (
            <Spinner />
          )}
        </>
      </Panel>
    </>
  );
};

export default RemoveSecretPanel;
