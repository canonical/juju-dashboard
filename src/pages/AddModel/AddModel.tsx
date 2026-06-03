import { ActionButton, Button } from "@canonical/react-components";
import VanillaPanel from "@canonical/react-components/dist/components/Panel";
import { Formik } from "formik";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import * as Yup from "yup";

import CheckPermissions from "components/CheckPermissions";
import FormikFormData from "components/FormikFormData";
import { useCanAddModel } from "hooks/useCanAddModel";
import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { getAddModelState } from "store/juju/selectors";
import modelListSource from "store/middleware/source/model-list";
import { useAppDispatch, useAppSelector } from "store/store";
import { testId } from "testing/utils";
import urls from "urls";
import { toErrorString } from "utils";
import { toastNotification } from "utils/toastNotification";

import AccessManagement from "./AccessManagement";
import AddModelStepper from "./AddModelStepper";
import ConfigsConstraints from "./ConfigsConstraints";
import { CONFIG_CATEGORIES } from "./ConfigsConstraints/configCatalog";
import { FieldName as ConfigFieldName } from "./ConfigsConstraints/types";
import { DisableType } from "./ConfigsConstraints/types";
import {
  buildConfigsConstraintsPayload,
  getConfigInitialValues,
} from "./ConfigsConstraints/utils";
import MandatoryDetails from "./MandatoryDetails";
import {
  TestId,
  StepType,
  Label,
  InputMode,
  type AddModelFormState,
  type StepDefinition,
} from "./types";
import { getCredentialError } from "./utils";

const MODEL_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

const validationSchema = Yup.object().shape({
  modelName: Yup.string()
    .matches(MODEL_NAME_PATTERN, Label.INCORRECT_MODEL_NAME_ERROR)
    .required("Required"),
  credential: Yup.string().test({
    test: function (value) {
      if (value !== undefined && value !== "") {
        return true;
      }
      return this.createError({
        message: getCredentialError(this.parent.cloud),
      });
    },
  }),
});

const stepDefinitions: StepDefinition[] = [
  {
    key: StepType.MANDATORY_DETAILS,
    title: "Mandatory Details",
    content: <MandatoryDetails />,
  },
  {
    key: StepType.CONFIGURATION_CONSTRAINTS,
    title: "Configuration & Constraints (optional)",
    content: <ConfigsConstraints />,
  },
  {
    key: StepType.ACCESS_MANAGEMENT,
    title: "Access Management (optional)",
    content: <AccessManagement />,
  },
];

const AddModel: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userTag = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const canCreateModel = useCanAddModel();
  const addModelState = useAppSelector(getAddModelState);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [modelName, setModelName] = useState<string>("");

  const handleCancel = (): void => {
    void navigate(urls.models.index);
  };

  const handleNextClick = (): void => {
    setCurrentStepIndex((index) => index + 1);
  };

  const handleCreateClick = (values: AddModelFormState): void => {
    if (!wsControllerURL || !userTag) {
      return;
    }

    const config = buildConfigsConstraintsPayload(values);
    const shareModelWith = values.shareModelWith ?? {};

    dispatch(
      jujuActions.addModel({
        wsControllerURL,
        modelName: values.modelName,
        cloudTag: values.cloud,
        credential: values.credential,
        userTag,
        disabledCommands: values.disabledCommands,
        region: values.region || undefined,
        ...(Object.keys(config).length > 0 ? { config } : {}),
        ...(Object.keys(shareModelWith).length > 0 ? { shareModelWith } : {}),
      }),
    );
    setModelName(values.modelName);
  };

  useEffect(() => {
    if (addModelState.loaded && !addModelState.loading && wsControllerURL) {
      if (addModelState.success) {
        // Handle a successful creation
        toastNotification(
          <b>Model "{modelName}" added successfully</b>,
          "positive",
        );
        dispatch(modelListSource.actions.invalidate({ wsControllerURL }));
        void navigate(urls.models.index);
      } else if (addModelState.errors) {
        // Handle a failed creation
        toastNotification(
          <>
            <b>Adding model "{modelName}" failed</b>
            <div>{toErrorString(addModelState.errors)}</div>
          </>,
          "negative",
        );
      }
      dispatch(jujuActions.setAddModelResult({ wsControllerURL }));
    }
  }, [modelName, addModelState, wsControllerURL, dispatch, navigate]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepDefinitions.length - 1;
  const currentStep = stepDefinitions[currentStepIndex];

  return (
    <CheckPermissions allowed={canCreateModel} {...testId(TestId.COMPONENT)}>
      <VanillaPanel
        className="add-model"
        contentClassName="add-model__content"
        title={Label.TITLE}
        {...testId(TestId.COMPONENT)}
        stickyHeader
      >
        <div className="add-model__step" {...testId(TestId.ADD_MODEL_CONTENT)}>
          <Formik<AddModelFormState>
            initialValues={{
              modelName: "",
              cloud: "",
              region: "",
              credential: "",
              [ConfigFieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
              [ConfigFieldName.CONSTRAINT_INPUT_MODE]: InputMode.LIST,
              [ConfigFieldName.CONFIG_YAML]: "",
              [ConfigFieldName.CONSTRAINT_YAML]: "",
              [ConfigFieldName.DISABLED_COMMANDS]: DisableType.NONE,
              ...getConfigInitialValues(CONFIG_CATEGORIES),
            }}
            validationSchema={validationSchema}
            // Mark credential as touched on mount as Vanilla doesn't display validation until the field loses focus.
            initialTouched={{ credential: true }}
            onSubmit={handleCreateClick}
          >
            <>
              <AddModelStepper
                stepDefinitions={stepDefinitions}
                currentStepIndex={currentStepIndex}
                handleStepClick={setCurrentStepIndex}
              />
              <FormikFormData
                onValidate={setIsValid}
                id={currentStep.key}
                {...testId(TestId.ADD_MODEL_FORM)}
                className={currentStep.key}
                stacked={currentStep.key === StepType.CONFIGURATION_CONSTRAINTS}
              >
                {currentStep.content}
              </FormikFormData>
            </>
          </Formik>
        </div>
        <div className="add-model__footer">
          <Button
            onClick={handleCancel}
            appearance="base"
            className="u-no-margin--right"
          >
            {Label.CANCEL_BUTTON}
          </Button>
          <span className="navigation-buttons">
            <Button
              onClick={() => {
                setCurrentStepIndex((index) => index - 1);
              }}
              appearance="secondary"
              disabled={isFirstStep}
            >
              {Label.BACK_BUTTON}
            </Button>
            <Button
              appearance="secondary"
              type="button"
              onClick={handleNextClick}
              disabled={isLastStep}
            >
              {Label.NEXT_BUTTON}
            </Button>
          </span>
          <ActionButton
            appearance="positive"
            type="submit"
            form={currentStep.key}
            disabled={!isValid}
          >
            {Label.CREATE_BUTTON}
          </ActionButton>
        </div>
      </VanillaPanel>
    </CheckPermissions>
  );
};

export default AddModel;
