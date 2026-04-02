import {
  Button,
  Chip,
  NotificationSeverity,
  Notification as VanillaNotification,
} from "@canonical/react-components";
import { Formik } from "formik";
import type { ReactNode } from "react";
import { useId, useState, type FC } from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";
import Panel from "components/Panel";
import { getModelUUIDFromList, getModelDataByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import isHigherSemver from "utils/isHigherSemver";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";
import { UpgradeModelPanelTestId } from "../index";
import type { Version } from "../types";

import Fields from "./Fields";
import type { FormFields } from "./types";
import { FieldName, Label, UpgradeType } from "./types";
import { getRecommendedVersions, versions } from "./utils";

type Props = {
  firstRender: boolean;
  modelName: null | string;
  onRemovePanelQueryParams: () => void;
  qualifier: null | string;
  setVersion: (version: Version) => void;
};

const UpgradeModelVersion: FC<Props> = ({
  firstRender,
  modelName,
  onRemovePanelQueryParams,
  qualifier,
  setVersion,
}) => {
  const recommendedVersions = getRecommendedVersions(versions);
  const titleId = useId();
  const formId = useId();
  const [isValid, setIsValid] = useState(false);
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  let content: ReactNode = null;
  if (!model) {
    content = (
      <VanillaNotification severity={NotificationSeverity.CAUTION}>
        {Label.NOT_FOUND}
      </VanillaNotification>
    );
  } else {
    const currentVersion = model?.model.version;
    const schema = Yup.object().shape({
      [FieldName.UPGRADE_TYPE]: Yup.string(),
      [FieldName.MANUAL_VERSION]: Yup.string().when(FieldName.UPGRADE_TYPE, {
        is: (value: string) => value === UpgradeType.MANUAL,
        then: (fieldSchema) =>
          fieldSchema
            .matches(/^\d+\.\d+\.\d+$/, Label.ERROR_FORMAT)
            .test({
              message: Label.ERROR_SAME,
              test: (value) => value !== currentVersion,
            })
            .test({
              message: Label.ERROR_NO_CONTROLLERS,
              test: (value) =>
                // TODO: this should check against the list of controller versions: https://warthogs.atlassian.net/browse/JUJU-9499
                !!versions.find((versionData) => versionData.version === value),
            })
            .test({
              message: Label.ERROR_OLDER,
              test: (value) => !value || isHigherSemver(value, currentVersion),
            }),
      }),
    });
    content = (
      <Formik<FormFields>
        initialValues={{
          [FieldName.MANUAL_VERSION]: "",
          [FieldName.RECOMMENDED_VERSION]: recommendedVersions[0].version,
          [FieldName.UPGRADE_TYPE]: UpgradeType.RECOMMENDED,
        }}
        onSubmit={(values) => {
          const version =
            values[FieldName.UPGRADE_TYPE] === UpgradeType.RECOMMENDED
              ? values[FieldName.RECOMMENDED_VERSION]
              : values[FieldName.MANUAL_VERSION];
          const upgradeVersion = versions.find(
            (versionData) => versionData.version === version,
          );
          // The form validation schema make sure that there is corresponding version data so
          // this 'if' is purely to satisfy the type checking.
          if (upgradeVersion) {
            setVersion(upgradeVersion);
          }
        }}
        validationSchema={schema}
      >
        <FormikFormData onValidate={setIsValid} id={formId}>
          <p>
            Current version{" "}
            <Chip
              isReadOnly
              isInline
              appearance="caution"
              value={currentVersion}
            />
          </p>
          <Fields currentVersion={currentVersion} />
        </FormikFormData>
      </Formik>
    );
  }
  return (
    <Panel
      animateMount={firstRender}
      drawer={
        <>
          <Button
            appearance="base"
            className="u-no-margin--bottom"
            onClick={onRemovePanelQueryParams}
            type="button"
          >
            {Label.CANCEL}
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            disabled={!isValid}
            form={formId}
            type="submit"
          >
            {Label.SUBMIT}
          </Button>
        </>
      }
      header={<UpgradeModelPanelHeader titleId={titleId} />}
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      titleId={titleId}
      width="unset"
      {...testId(UpgradeModelPanelTestId.PANEL)}
    >
      {content}
    </Panel>
  );
};

export default UpgradeModelVersion;
