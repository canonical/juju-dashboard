import {
  FormikField,
  NotificationSeverity,
  Select,
  Notification as VanillaNotification,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import type { Version } from "panels/UpgradeModelPanel/types";

import type { FormFields } from "../types";
import { FieldName } from "../types";

import { Label } from "./types";

type Props = {
  version: Version;
};

const Fields: FC<Props> = ({ version }) => {
  const { values } = useFormikContext<FormFields>();
  const showConfirm = version["requires-migration"]
    ? !!values[FieldName.TARGET_CONTROLLER]
    : true;

  return (
    <>
      {version["requires-migration"] ? (
        <FormikField
          component={Select}
          label={Label.TARGET_CONTROLLER}
          name={FieldName.TARGET_CONTROLLER}
          options={[
            {
              label: "",
              value: "",
            },
            // TODO populate the options with a list of target controllers that have been
            // filtered by the chosen version once the API support has been added:
            // https://warthogs.atlassian.net/browse/JUJU-9577.
            {
              label: "controller_1 | 4.0.1 | na-east-1",
              value: "controller_1",
            },
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
