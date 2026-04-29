import {
  Chip,
  CustomSelect,
  FormikField,
  NotificationSeverity,
  Notification as VanillaNotification,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import ModelVersion from "components/ModelVersion";
import type { VersionElem } from "juju/jimm/JIMMV4";
import {
  getControllerByUUID,
  getModelDataByUUID,
  getModelMigrationControllersByVersion,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { getControllerVersion } from "store/juju/utils/controllers";
import { useAppSelector } from "store/store";

import type { FormFields } from "../types";
import { FieldName } from "../types";

import { Label } from "./types";

type Props = {
  modelName: null | string;
  needsMigration: boolean;
  qualifier: null | string;
  version: VersionElem;
};

const Fields: FC<Props> = ({
  modelName,
  needsMigration,
  qualifier,
  version,
}) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  const currentVersion = model?.model.version;
  const modelController = useAppSelector((state) =>
    getControllerByUUID(state, model?.info?.["controller-uuid"]),
  );
  const controllerVersion = modelController
    ? getControllerVersion(modelController)
    : null;
  const targetControllers = useAppSelector((state) =>
    getModelMigrationControllersByVersion(state, modelUUID, version.version),
  );
  const { setFieldValue, values } = useFormikContext<FormFields>();
  const showConfirm = needsMigration
    ? !!values[FieldName.TARGET_CONTROLLER]
    : true;

  return (
    <>
      {needsMigration ? (
        <VanillaNotification severity={NotificationSeverity.INFORMATION}>
          {Label.REQUIRES_MIGRATION}
        </VanillaNotification>
      ) : null}
      <h5>Changes</h5>
      <table className="u-no-margin--bottom">
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
                  <ModelVersion
                    modelName={model.model.name}
                    qualifier={qualifier}
                  />
                ) : null}
              </div>
              <span>&rarr;</span>
            </td>
            <td>
              <ModelVersion
                modelName={model?.model.name}
                qualifier={qualifier}
                versionOverride={version.version}
              />
            </td>
          </tr>
          {needsMigration ? (
            <tr>
              <th></th>
              <td className="u-flex">
                <div className="u-flex-grow">
                  <span className="u-sh1--right">{modelController?.name}</span>
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
              <td className="controller-select__cell">
                {needsMigration ? (
                  <>
                    <FormikField
                      name={FieldName.TARGET_CONTROLLER}
                      type="hidden"
                    />
                    <CustomSelect
                      defaultToggleLabel={Label.TARGET_CONTROLLER}
                      toggleClassName="controller-select__toggle"
                      dropdownClassName="controller-select__dropdown prevent-panel-close"
                      value={values[FieldName.TARGET_CONTROLLER]}
                      onChange={(value) => {
                        void setFieldValue(FieldName.TARGET_CONTROLLER, value);
                      }}
                      options={[
                        ...(targetControllers
                          ?.filter(
                            (
                              controller,
                            ): controller is {
                              name: string;
                            } & typeof controller =>
                              controller.name !== undefined,
                          )
                          .map((controller) => {
                            const optionVersion =
                              getControllerVersion(controller);
                            return {
                              label: (
                                <span className="u-flex">
                                  <span className="u-flex-grow">
                                    {controller.name}
                                  </span>
                                  <span>
                                    {optionVersion ? (
                                      <Chip
                                        isReadOnly
                                        isDense
                                        isInline
                                        value={optionVersion}
                                      />
                                    ) : null}
                                  </span>
                                </span>
                              ),
                              text: controller.name,
                              value: controller.name,
                            };
                          }) ?? []),
                      ]}
                    />
                  </>
                ) : null}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
      <hr />
      {showConfirm ? (
        <div className="u-flex-grow u-flex-content-end u-sv3">
          <div className="u-sv1">
            <VanillaNotification
              className="u-no-margin--bottom"
              messageElement="div"
              severity={NotificationSeverity.CAUTION}
              title={Label.REVIEW_RISKS}
            >
              <ul>
                <li>
                  Downtime: during migration, model will not be stuck, make sure
                  no one is using the model before starting.
                </li>
                <li>
                  Recovery: there is no automated fallback. If the migration
                  fails, you must manually restore models to a usable state.
                </li>
                <li>
                  Relations: cross-controller relations (CCR) may require manual
                  review after migration.
                </li>
              </ul>
            </VanillaNotification>
          </div>
          <FormikField
            label={Label.CONFIRM}
            name={FieldName.CONFIRM}
            type="checkbox"
          />
        </div>
      ) : null}
    </>
  );
};

export default Fields;
