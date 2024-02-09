import type {
  CreateSecretArg,
  ErrorResults,
  StringResults,
  UpdateUserSecretArg,
} from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import { ActionButton, Button, Spinner } from "@canonical/react-components";
import { Form, Formik } from "formik";
import { useId, useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import * as Yup from "yup";

import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import {
  useCreateSecrets,
  useListSecrets,
  useUpdateSecrets,
  useGetSecretContent,
} from "juju/apiHooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import { actions as jujuActions } from "store/juju";
import {
  getSecretByURI,
  getModelUUIDFromList,
  getSecretsContent,
  getSecretsContentErrors,
  getSecretsContentLoaded,
  getSecretsContentLoading,
  getModelByUUID,
} from "store/juju/selectors";
import { useAppSelector, useAppDispatch } from "store/store";

import Fields from "./Fields";
import { type FormFields } from "./types";

export enum TestId {
  PANEL = "secret-form-panel",
}

export enum Label {
  CANCEL = "Cancel",
  SUBMIT_ADD = "Add secret",
  SUBMIT_UPDATE = "Update secret",
  TITLE_ADD = "Add a secret",
  TITLE_UPDATE = "Update secret",
}

type Props = {
  update?: boolean;
};

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

const SecretFormPanel = ({ update }: Props) => {
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
  const dispatch = useAppDispatch();
  const secretURI = queryParams.secret;
  const secret = useAppSelector((state) =>
    getSecretByURI(state, modelUUID, secretURI),
  );
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const existingContent = useAppSelector((state) =>
    getSecretsContent(state, modelUUID),
  );
  const contentError = useAppSelector((state) =>
    getSecretsContentErrors(state, modelUUID),
  );
  const contentLoaded = useAppSelector((state) =>
    getSecretsContentLoaded(state, modelUUID),
  );
  const contentLoading = useAppSelector((state) =>
    getSecretsContentLoading(state, modelUUID),
  );
  const listSecrets = useListSecrets(userName, modelName);
  const createSecrets = useCreateSecrets(userName, modelName);
  const updateSecrets = useUpdateSecrets(userName, modelName);
  const getSecretContent = useGetSecretContent(userName, modelName);
  const existingPairs = existingContent
    ? Object.entries(existingContent).map(([key, value]) => ({
        key,
        value: atob(value),
        isBase64: false,
      }))
    : null;
  const defaultPairs = [{ key: "", value: "", isBase64: false }];

  useEffect(() => {
    if (secretURI) {
      getSecretContent(secretURI);
    }
  }, [getSecretContent, secretURI]);

  useEffect(
    () => () => {
      if (wsControllerURL) {
        dispatch(
          jujuActions.clearSecretsContent({
            modelUUID,
            wsControllerURL,
          }),
        );
      }
    },
    [dispatch, modelUUID, wsControllerURL],
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
              {update ? Label.SUBMIT_UPDATE : Label.SUBMIT_ADD}
            </ActionButton>
          </>
        }
        onRemovePanelQueryParams={handleRemovePanelQueryParams}
        ref={scrollArea}
        title={update ? Label.TITLE_UPDATE : Label.TITLE_ADD}
        width="narrow"
      >
        <>
          <PanelInlineErrors
            inlineErrors={[inlineError, contentError]}
            scrollArea={scrollArea.current}
          />
          {(update && secret && !contentLoading && contentLoaded) || !update ? (
            <Formik<FormFields>
              initialValues={{
                autoPrune: false,
                description: update ? secret?.description ?? "" : "",
                label: update ? secret?.label ?? "" : "",
                pairs: update ? existingPairs ?? defaultPairs : defaultPairs,
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
                (update
                  ? updateSecrets([
                      {
                        "auto-prune": values.autoPrune,
                        content: {
                          data: content,
                        },
                        description: values.description,
                        label: values.label || undefined,
                        uri: secretURI,
                        // The type includes an UpsertSecretArg object due to a
                        // schema.json issue which should be rectified in the future,
                        // it also lists owner-tag as required though it is not.
                      } as UpdateUserSecretArg,
                    ])
                  : createSecrets([
                      {
                        content: {
                          data: content,
                        },
                        description: values.description,
                        label: values.label || undefined,
                        // The type includes an UpsertSecretArg object due to a
                        // schema.json issue which should be rectified in the future,
                        // it also lists owner-tag as required though it is not.
                      } as CreateSecretArg,
                    ])
                )
                  .then((response: StringResults | ErrorResults | string) => {
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
                <Fields update={update} />
              </Form>
            </Formik>
          ) : (
            <div className="u-align--center">
              <Spinner />
            </div>
          )}
        </>
      </Panel>
    </>
  );
};

export default SecretFormPanel;
