import type { ErrorResults } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import {
  ActionButton,
  Button,
  FormikField,
  Spinner,
} from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef } from "react";
import { useParams } from "react-router";

import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes";
import SecretLabel from "components/secrets/SecretLabel";
import {
  useListSecrets,
  useGrantSecret,
  useRevokeSecret,
} from "juju/api-hooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import {
  getSecretByURI,
  getModelUUIDFromList,
  getModelApplications,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { toErrorString } from "utils";

import { Label, TestId } from "./types";

export type FormFields = {
  applications: string[];
};

const handleErrors = (response: ErrorResults) => {
  const errors = response.results.reduce((errorString, { error }) => {
    if (error?.message) {
      errorString = [errorString, error.message].filter(Boolean).join(". ");
    }
    return errorString;
  }, "");
  if (errors) {
    throw new Error(errors);
  }
};

const GrantSecretPanel = () => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
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
  const modelApps = Object.keys(applications ?? {});

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
              disabled={saving || modelApps.length === 0}
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
          {secretURI && secret ? (
            <Formik<FormFields>
              initialValues={{
                applications: currentApplications,
              }}
              onSubmit={async (values) => {
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
                  setInlineError(toErrorString(error));
                }
              }}
            >
              <Form id={formId}>
                {modelApps.length > 0 ? (
                  <>
                    <h5>
                      Secret: <SecretLabel secret={secret} />
                    </h5>
                    <p>
                      Grant applications access to view the value of this
                      secret. Deselected applications will have their access
                      revoked.
                    </p>
                    <div id={groupId}>Applications</div>
                    <div role="group" aria-labelledby={groupId}>
                      {modelApps.map((app) => {
                        const isOwner =
                          app ===
                          secret["owner-tag"].replace(/^application-/, "");
                        return isOwner ? (
                          // The owner field is not managed by Formik, it is for
                          // display purposes only.
                          <FormikField
                            checked
                            disabled
                            key={app}
                            label={`${app} (secret owner)`}
                            name="owner"
                            type="checkbox"
                          />
                        ) : (
                          <FormikField
                            id={app}
                            key={app}
                            label={app}
                            name="applications"
                            type="checkbox"
                            value={app}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p>{Label.NO_APPS}</p>
                )}
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
