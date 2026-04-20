import {
  Button,
  Chip,
  Icon,
  ICONS,
  NotificationSeverity,
  Notification as VanillaNotification,
} from "@canonical/react-components";
import { Formik } from "formik";
import { useId, useState, type FC } from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";
import Panel from "components/Panel";
import type { VersionElem } from "juju/jimm/JIMMV4";
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import {
  getControllerByUUID,
  getModelDataByUUID,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { getControllerVersion } from "store/juju/utils/controllers";
import { requiresMigration } from "store/juju/utils/upgrades";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";

import Fields from "./Fields";
import type { FormFields } from "./types";
import { FieldName, Label } from "./types";

export type Props = {
  back: () => void;
  modelName: null | string;
  onRemovePanelQueryParams: () => void;
  version: VersionElem;
  qualifier: null | string;
};

const UpgradeModelController: FC<Props> = ({
  back,
  modelName,
  onRemovePanelQueryParams,
  version,
  qualifier,
}) => {
  const formId = useId();
  const [isValid, setIsValid] = useState(false);
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  const titleId = useId();
  const modelController = useAppSelector((state) =>
    getControllerByUUID(state, model?.info?.["controller-uuid"]),
  );
  const controllerVersion = modelController
    ? getControllerVersion(modelController)
    : null;
  const currentVersion = model?.model.version;
  const needsMigration =
    (controllerVersion &&
      requiresMigration(controllerVersion, version.version)) ||
    false;
  const schema = Yup.object().shape({
    [FieldName.TARGET_CONTROLLER]: Yup.string().test({
      name: "required",
      test: (value) => (needsMigration ? !!value : true),
      message: "You must select a target controller.",
    }),
    [FieldName.CONFIRM]: Yup.boolean().test({
      name: "checked",
      test: (value) => !!value,
      message: "You must confirm to be able to upgrade.",
    }),
  });
  return (
    <Panel
      animateMount={false}
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
      header={
        <UpgradeModelPanelHeader
          titleId={titleId}
          version={version.version}
          back={back}
        />
      }
      onRemovePanelQueryParams={onRemovePanelQueryParams}
      scrollingContentClassName="u-flex"
      titleId={titleId}
      width="unset"
      {...testId(CharmsAndActionsPanelTestId.PANEL)}
    >
      <div className="u-flex u-flex-column">
        <h5>Changes</h5>
        <table>
          <thead>
            <tr>
              <th>{Label.HEADER_MODEL_NAME}</th>
              <th>{Label.HEADER_CURRENT_VERSION}</th>
              <th>{Label.HEADER_UPGRADE_VERSION}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{modelName}</th>
              <td className="u-flex">
                <div className="u-flex-grow">
                  {currentVersion ? (
                    <Chip
                      isReadOnly
                      isDense
                      isInline
                      appearance="caution"
                      value={currentVersion}
                    />
                  ) : null}
                </div>
                <span>&rarr;</span>
              </td>
              <td>
                <Chip isReadOnly isDense isInline value={version.version} />
              </td>
            </tr>
            {needsMigration ? (
              <tr>
                <th></th>
                <td className="u-flex">
                  <div className="u-flex-grow">
                    <p className="u-no-padding--top u-no-margin--bottom">
                      {modelController?.name}
                    </p>
                    {controllerVersion ? (
                      <Chip
                        isReadOnly
                        isDense
                        isInline
                        value={controllerVersion}
                      />
                    ) : null}
                  </div>
                  <span className="u-flex-content-center">&rarr;</span>
                </td>
                <td className="u-vertical-align--middle">
                  <Icon name={ICONS.help} />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <Formik<FormFields>
          initialValues={{
            [FieldName.TARGET_CONTROLLER]: "",
            [FieldName.CONFIRM]: false,
          }}
          onSubmit={(_values) => {
            // TODO: start the upgrade: https://warthogs.atlassian.net/browse/JUJU-9503
            onRemovePanelQueryParams();
          }}
          validationSchema={schema}
          validateOnMount
        >
          <FormikFormData
            className="u-flex u-flex-grow u-flex-column"
            onValidate={setIsValid}
            id={formId}
          >
            {needsMigration ? (
              <VanillaNotification severity={NotificationSeverity.INFORMATION}>
                {Label.REQUIRES_MIGRATION}
              </VanillaNotification>
            ) : null}
            <Fields
              modelName={modelName}
              needsMigration={needsMigration}
              qualifier={qualifier}
              version={version}
            />
          </FormikFormData>
        </Formik>
      </div>
    </Panel>
  );
};

export default UpgradeModelController;
