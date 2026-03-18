import {
  ActionButton,
  Button,
  Step,
  Stepper,
} from "@canonical/react-components";
import classNames from "classnames";
import type { FC, JSX } from "react";
import { useNavigate } from "react-router";

import CheckPermissions from "components/CheckPermissions";
import { useQueryParams } from "hooks/useQueryParams";
import MainContent from "layout/MainContent";
import { getCloudInfoState } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import urls from "urls";

import { TestId } from "./types";

const steps = [
  "mandatory-details",
  "configuration-constraints",
  "access-management",
] as const;

type StepType = (typeof steps)[number];

const getStepType = (step: null | string): StepType => {
  if (step && steps.includes(step as StepType)) {
    return step as StepType;
  }
  return "mandatory-details";
};

const AddModel: FC = () => {
  const navigate = useNavigate();
  const cloudInfo = useAppSelector(getCloudInfoState).clouds;
  const [queryParams, setQueryParams] = useQueryParams<{
    step: null | string;
  }>({
    step: "mandatory-details",
  });
  const stepType = getStepType(queryParams.step);

  const canCreateModel = !!cloudInfo && Object.keys(cloudInfo).length > 0;

  const stepContent: Record<StepType, JSX.Element> = {
    "mandatory-details": (
      <div className="mandatory-details">Mandatory details form goes here.</div>
    ),
    "configuration-constraints": (
      <div className="configuration-constraints">
        Configuration and constraints form goes here.
      </div>
    ),
    "access-management": (
      <div className="access-management">Access management form goes here.</div>
    ),
  };

  return (
    <CheckPermissions allowed={canCreateModel} {...testId(TestId.COMPONENT)}>
      <MainContent
        {...testId(TestId.COMPONENT)}
        title="Add Model"
        titleClassName={classNames("add-model__header")}
        titleComponent="div"
      >
        <Stepper
          variant="horizontal"
          steps={[
            <Step
              key="Step 1"
              title="Mandatory details"
              index={1}
              enabled
              hasProgressLine
              iconName="number"
              handleClick={() => {
                setQueryParams({ step: "mandatory-details" });
              }}
            />,
            <Step
              key="Step 2"
              title="Configuration & Constraints (optional)"
              index={2}
              enabled
              hasProgressLine={false}
              iconName="number"
              handleClick={() => {
                setQueryParams({ step: "configuration-constraints" });
              }}
            />,
            <Step
              key="Step 3"
              title="Access management (optional)"
              index={3}
              enabled
              hasProgressLine={false}
              iconName="number"
              handleClick={() => {
                setQueryParams({ step: "access-management" });
              }}
            />,
          ]}
        />
        <div className={`add-model add-model__${stepType}`}>
          {stepContent[stepType]}
        </div>
        <div className="u-align--right">
          <hr />
          <Button
            onClick={() => void navigate(urls.models.index)}
            appearance="base"
          >
            Cancel
          </Button>
          <ActionButton appearance="positive" onClick={() => {}}>
            Next
          </ActionButton>
        </div>
      </MainContent>
    </CheckPermissions>
  );
};

export default AddModel;
