import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { ActionButton, Button, Spinner } from "@canonical/react-components";
import { Form, Formik } from "formik";
import type { FC } from "react";
import { useId, useState, useRef, useCallback } from "react";

import Panel from "components/Panel";
import { useModelIndexParams } from "components/hooks";
import SecretLabel from "components/secrets/SecretLabel";
import { useRemoveSecrets, useListSecrets } from "juju/api-hooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import {
  getSecretByURI,
  getModelUUIDFromList,
  getSecretLatestRevision,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { toErrorString } from "utils";

import Fields from "./Fields";
import { Label, TestId, type FormFields } from "./types";

const RemoveSecretPanel: FC = () => {
  const { modelName, qualifier } = useModelIndexParams();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [queryParams, , handleRemovePanelQueryParams] = usePanelQueryParams<{
    panel: null | string;
    secret: null | string;
  }>({
    panel: null,
    secret: null,
  });
  const secretURI = queryParams.secret;
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  const latestRevision = useAppSelector((state) =>
    getSecretLatestRevision(state, modelUUID, secretURI),
  );
  const [inlineError, setInlineError] = useState<null | string>(null);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const removeSecrets = useRemoveSecrets(qualifier, modelName);
  const listSecrets = useListSecrets(qualifier, modelName);

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
        .then((response: ErrorResults) => {
          const error = response.results[0]?.error?.message;
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
          setInlineError(toErrorString(error));
        });
    },
    [handleRemovePanelQueryParams, listSecrets, removeSecrets, secretURI],
  );

  return (
    <>
      <Panel
        {...testId(TestId.PANEL)}
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
                revision: (latestRevision ?? "").toString(),
              }}
              onSubmit={() => {
                setShowConfirm(true);
              }}
            >
              <Form id={formId}>
                <h5>
                  Secret: <SecretLabel secret={secret} />
                </h5>
                <Fields
                  handleRemoveSecret={handleRemoveSecret}
                  hideConfirm={() => {
                    setShowConfirm(false);
                  }}
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
