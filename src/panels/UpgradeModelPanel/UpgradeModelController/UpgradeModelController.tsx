import { Button } from "@canonical/react-components";
import { Formik } from "formik";
import { useId, useState, type FC } from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";
import Panel from "components/Panel";
import type { VersionElem } from "juju/jimm/JIMMV4";
import { CharmsAndActionsPanelTestId } from "panels/CharmsAndActionsPanel";
import { getWSControllerURL } from "store/general/selectors";
import {
  getControllerByUUID,
  getModelDataByUUID,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { getControllerVersion } from "store/juju/utils/controllers";
import { requiresMigration } from "store/juju/utils/upgrades";
import { upgradeTo } from "store/middleware/process";
import { useAppDispatch, useAppSelector } from "store/store";
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
  const dispatch = useAppDispatch();
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
  const needsMigration =
    (controllerVersion &&
      requiresMigration(controllerVersion, version.version)) ||
    false;
  const wsControllerURL = useAppSelector(getWSControllerURL);
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
  function triggerMigration(values: FormFields): void {
    const currentVersion = model?.info?.["agent-version"];
    if (!wsControllerURL) {
      throw new Error("wsControllerURL is required");
    }
    if (!modelUUID) {
      throw new Error("modelUUID is missing");
    }
    if (!currentVersion) {
      throw new Error("currentVersion is missing");
    }

    if (needsMigration) {
      const action = upgradeTo.run({
        targetVersion: version.version,
        targetController: values[FieldName.TARGET_CONTROLLER],
        currentVersion,
        wsControllerURL,
        modelUUID,
        // TODO: Use the getModelURL util here once it lands:
        // https://github.com/canonical/juju-dashboard/pull/2285/changes#diff-b8618585b6c69654e35b6b6a0f188d72b59777badd2798cfd1d027a396ed0566R1
        modelURL: wsControllerURL.replace("/api", `/model/${modelUUID}/api`),
        modelName: modelName,
      });
      dispatch(action);
    }
  }
  return (
    <Panel
      animateMount={false}
      checkCanClose={(event) => {
        const target = event.target as HTMLElement;
        // Prevent clicks in the custom select dropdown from closing the panel (the
        // dropdown is rendered inside a portal so is outside the panel's children.)
        return !target.closest(".prevent-panel-close");
      }}
      contentClassName="no-indent"
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
      width="medium"
      {...testId(CharmsAndActionsPanelTestId.PANEL)}
    >
      <div className="u-flex u-flex-column">
        <Formik<FormFields>
          initialValues={{
            [FieldName.TARGET_CONTROLLER]: "",
            [FieldName.CONFIRM]: false,
          }}
          onSubmit={(values) => {
            triggerMigration(values);
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
