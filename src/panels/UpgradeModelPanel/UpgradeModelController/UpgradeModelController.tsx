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
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import {
  getControllerDataByUUID,
  getModelDataByUUID,
  getModelUUIDFromList,
} from "store/juju/selectors";
import type { Controller } from "store/juju/types";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import UpgradeModelPanelHeader from "../UpgradeModelPanelHeader";
import type { Version } from "../types";

import Fields from "./Fields";
import type { FormFields } from "./types";
import { FieldName, Label } from "./types";

export type Props = {
  back: () => void;
  modelName: null | string;
  onRemovePanelQueryParams: () => void;
  version: Version;
  qualifier: null | string;
};

const getModelController = (
  controllerData: [string, Controller[]] | null | undefined,
  controllerUUID?: string,
): Controller | null => {
  let modelController: Controller | null = null;
  if (controllerData) {
    const [_wsAddress, controllers] = controllerData;
    for (const controller of controllers) {
      if (controller.uuid === controllerUUID) {
        modelController = controller;
        break;
      }
    }
  }
  return modelController;
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
  const controllerUUID = model?.info?.["controller-uuid"];
  const controllerData = useAppSelector((state) =>
    getControllerDataByUUID(state, controllerUUID),
  );
  // TODO: fetch the real list of controller targets once implemented: https://warthogs.atlassian.net/browse/JUJU-9577.
  const modelController = getModelController(controllerData, controllerUUID);
  const titleId = useId();
  const currentVersion = model?.model.version;
  const schema = Yup.object().shape({
    [FieldName.TARGET_CONTROLLER]: Yup.string().test({
      name: "required",
      test: (value) => (version["requires-migration"] ? !!value : true),
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
            {version["requires-migration"] ? (
              <tr>
                <th></th>
                <td className="u-flex">
                  <div className="u-flex-grow">
                    <p className="u-no-padding--top u-no-margin--bottom">
                      {modelController?.name}
                    </p>
                    {modelController && "agent-version" in modelController ? (
                      <Chip
                        isReadOnly
                        isDense
                        isInline
                        value={modelController["agent-version"]}
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
            {version["requires-migration"] ? (
              <VanillaNotification severity={NotificationSeverity.INFORMATION}>
                {Label.REQUIRES_MIGRATION}
              </VanillaNotification>
            ) : null}
            <Fields version={version} />
          </FormikFormData>
        </Formik>
      </div>
    </Panel>
  );
};

export default UpgradeModelController;
