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
import type { VersionElem } from "juju/jimm/JIMMV4";
import {
  getModelUUIDFromList,
  getModelUpgradeVersions,
  getSupportedJujuVersions,
  getRecommendedVersions,
  getModelListLoaded,
  getModelMigrationTargets,
  getModelDataByUUID,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import isHigherSemver from "utils/isHigherSemver";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";
import { UpgradeModelPanelTestId } from "../index";

import Fields from "./Fields";
import type { FormFields } from "./types";
import { FieldName, Label, UpgradeType } from "./types";

type Props = {
  firstRender: boolean;
  modelName: null | string;
  onRemovePanelQueryParams: () => void;
  qualifier: null | string;
  setVersion: (version: VersionElem) => void;
};

const UpgradeModelVersion: FC<Props> = ({
  firstRender,
  modelName,
  onRemovePanelQueryParams,
  qualifier,
  setVersion,
}) => {
  const titleId = useId();
  const formId = useId();
  const [isValid, setIsValid] = useState(false);
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  const supportedJujuVersions = useAppSelector(getSupportedJujuVersions);
  const modelMigrationTargets = useAppSelector((state) =>
    getModelMigrationTargets(state, modelUUID),
  );
  const recommendedVersions = useAppSelector((state) =>
    getRecommendedVersions(state, modelUUID),
  );
  const availableVersions = useAppSelector((state) =>
    getModelUpgradeVersions(state, modelUUID),
  );
  const modelsLoaded = useAppSelector(getModelListLoaded);
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
      [FieldName.RECOMMENDED_VERSION]: Yup.string().when(
        FieldName.UPGRADE_TYPE,
        {
          is: (value: string) => value === UpgradeType.RECOMMENDED,
          then: (fieldSchema) => fieldSchema.required(),
        },
      ),
      [FieldName.UPGRADE_TYPE]: Yup.string(),
      [FieldName.MANUAL_VERSION]: Yup.string().when(FieldName.UPGRADE_TYPE, {
        is: (value: string) => value === UpgradeType.MANUAL,
        then: (fieldSchema) =>
          fieldSchema
            .required(Label.ERROR_FORMAT)
            .matches(/^\d+\.\d+\.\d+$/, Label.ERROR_FORMAT)
            .test({
              message: Label.ERROR_SAME,
              test: (value) => !currentVersion || value !== currentVersion,
            })
            .test({
              message: Label.ERROR_NO_CONTROLLERS,
              test: (value) =>
                !!availableVersions?.find(
                  (versionData) => !value || versionData.version === value,
                ),
            })
            .test({
              message: Label.ERROR_OLDER,
              test: (value) =>
                !currentVersion ||
                !value ||
                isHigherSemver(value, currentVersion),
            }),
      }),
    });
    content = (
      <>
        {currentVersion ? (
          <p>
            Current version{" "}
            <Chip
              isReadOnly
              isInline
              appearance="caution"
              value={currentVersion}
            />
          </p>
        ) : null}
        <Formik<FormFields>
          initialValues={{
            [FieldName.MANUAL_VERSION]: "",
            [FieldName.RECOMMENDED_VERSION]: recommendedVersions[0]?.version,
            [FieldName.UPGRADE_TYPE]: UpgradeType.RECOMMENDED,
          }}
          onSubmit={(values) => {
            const version =
              values[FieldName.UPGRADE_TYPE] === UpgradeType.RECOMMENDED
                ? values[FieldName.RECOMMENDED_VERSION]
                : values[FieldName.MANUAL_VERSION];
            const upgradeVersion = availableVersions?.find(
              (versionData) => versionData.version === version,
            );
            // The form validation schema makes sure that there is corresponding version data so
            // this 'if' is purely to satisfy the type checking.
            if (upgradeVersion) {
              setVersion(upgradeVersion);
            }
          }}
          validationSchema={schema}
        >
          <FormikFormData
            onValidate={setIsValid}
            id={formId}
            skipFirstValidation={false}
          >
            <Fields modelName={modelName} qualifier={qualifier} />
          </FormikFormData>
        </Formik>
      </>
    );
  }
  return (
    <Panel
      animateMount={firstRender}
      contentClassName="no-indent"
      loading={
        !modelsLoaded ||
        // This checks the existence of the data instead of using the loading state otherwise,
        // each time it fetches data in the background the form would be replaced with the spinner.
        !supportedJujuVersions.data ||
        (!!model && !modelMigrationTargets.data)
      }
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
      width="medium"
      {...testId(UpgradeModelPanelTestId.PANEL)}
    >
      {content}
    </Panel>
  );
};

export default UpgradeModelVersion;
