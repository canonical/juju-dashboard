import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { ActionButton, Button, Spinner } from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import FormikField from "components/FormikField";
import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useListSecrets, useGrantSecret, useRevokeSecret } from "juju/apiHooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import {
  getSecretByURI,
  getModelUUIDFromList,
  getModelApplications,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

export enum TestId {
  PANEL = "grant-secret-panel",
}

export enum Label {
  CANCEL = "Cancel",
  SUBMIT = "Grant",
}

export type FormFields = {
  applications: string[];
};

const handleErrors = (response: string | ErrorResults) => {
  if (typeof response === "string") {
    throw new Error(response);
  } else if (Array.isArray(response.results)) {
    const error = response.results.find(({ error }) => !!error);
    if (error?.error?.message) {
      throw new Error(error.error?.message);
    }
  }
};

const GrantSecretPanel = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const scrollArea = useRef<HTMLDivElement>(null);
  const formId = useId();
  const groupId = useId();
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
  const grantSecret = useGrantSecret(userName, modelName);
  const revokeSecret = useRevokeSecret(userName, modelName);
  const listSecrets = useListSecrets(userName, modelName);
  const currentApplications =
    secret?.access?.map((access) =>
      access["target-tag"].replace(/^application-/, ""),
    ) ?? [];

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
        title="Grant access"
        width="narrow"
      >
        <>
          <PanelInlineErrors
            inlineErrors={[inlineError]}
            scrollArea={scrollArea.current}
          />
          <p>
            Grant applications access to view the value of this secret.
            Deselected applications will have their access revoked.
          </p>
          {secret ? (
            <Formik<FormFields>
              initialValues={{
                applications: currentApplications,
              }}
              onSubmit={async (values) => {
                if (!secretURI) {
                  // The form isn't shown if the secretURI doesn't exist so it's not possible to get to this point.
                  return;
                }
                setSaving(true);
                setInlineError(null);
                const grantApps = values.applications.filter(
                  (app) => !currentApplications.includes(app),
                );
                const revokeApps = currentApplications.filter(
                  (app) => !values.applications.includes(app),
                );
                try {
                  if (grantApps.length) {
                    const response = await grantSecret(
                      secretURI,
                      values.applications,
                    );
                    handleErrors(response);
                  }
                  if (revokeApps.length) {
                    const response = await revokeSecret(secretURI, revokeApps);
                    handleErrors(response);
                  }
                  listSecrets();
                  handleRemovePanelQueryParams();
                } catch (error) {
                  setSaving(false);
                  if (typeof error === "string" || error instanceof Error) {
                    setInlineError(
                      error instanceof Error ? error.message : error,
                    );
                  }
                }
              }}
            >
              <Form id={formId}>
                <div id={groupId}>Applications</div>
                <div role="group" aria-labelledby={groupId}>
                  {Object.keys(applications ?? {}).map((app) => (
                    <FormikField
                      id={app}
                      key={app}
                      label={app}
                      name="applications"
                      type="checkbox"
                      value={app}
                    />
                  ))}
                </div>
              </Form>
            </Formik>
          ) : (
            <Spinner aria-label="Loading" />
          )}
        </>
      </Panel>
    </>
  );
};

export default GrantSecretPanel;
