import {
  FormikField,
  NotificationSeverity,
  Select,
  Notification as VanillaNotification,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import type { VersionElem } from "juju/jimm/JIMMV4";
import {
  getModelMigrationControllersByVersion,
  getModelUUIDFromList,
} from "store/juju/selectors";
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
  const targetControllers = useAppSelector((state) =>
    getModelMigrationControllersByVersion(state, modelUUID, version.version),
  );
  const { values } = useFormikContext<FormFields>();
  const showConfirm = needsMigration
    ? !!values[FieldName.TARGET_CONTROLLER]
    : true;

  return (
    <>
      {needsMigration ? (
        <FormikField
          component={Select}
          label={Label.TARGET_CONTROLLER}
          name={FieldName.TARGET_CONTROLLER}
          options={[
            {
              label: "",
              value: "",
            },
            ...(targetControllers?.map((controller) => ({
              label: controller.name,
              value: controller.uuid,
            })) ?? []),
          ]}
        />
      ) : null}
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
