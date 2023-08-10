import { Input } from "@canonical/react-components";
import { Field, useFormikContext } from "formik";
import { useSelector } from "react-redux";

import AutocompleteInput from "components/AutocompleteInput";
import {
  getAuditEventsFacades,
  getAuditEventsMethods,
  getAuditEventsUsers,
  getAuditEventsModels,
  getModelNames,
  getUsers,
} from "store/juju/selectors";

import type { FormFields } from "../types";

export enum Label {
  AFTER = "After",
  BEFORE = "Before",
  FACADE = "Facade",
  METHOD = "Method",
  MODEL = "Model",
  USER = "User",
  VERSION = "Version",
}

const Fields = (): JSX.Element => {
  const auditEventUsers = useSelector(getAuditEventsUsers);
  const jujuUsers = useSelector(getUsers);
  // Get the unique users from the logs and models returned from Juju.
  const users = Array.from(new Set([...auditEventUsers, ...jujuUsers]));
  const auditEventModels = useSelector(getAuditEventsModels);
  const jujuModels = useSelector(getModelNames);
  // Get the unique model names from the logs and models returned from Juju.
  const models = Array.from(new Set([...auditEventModels, ...jujuModels]));
  const facades = useSelector(getAuditEventsFacades);
  const methods = useSelector(getAuditEventsMethods);
  const { values } = useFormikContext<FormFields>();

  return (
    <>
      <Field
        type="datetime-local"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.AFTER}
        label={Label.AFTER}
        // Prevent this field from choosing a date after the 'Before' date.
        max={values.before}
        name="after"
        as={Input}
      />
      <Field
        type="datetime-local"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.BEFORE}
        label={Label.BEFORE}
        // Prevent this field from choosing a date before the 'After' date.
        min={values.after}
        name="before"
        as={Input}
      />
      <Field
        type="text"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.USER}
        label={Label.USER}
        name="user"
        as={AutocompleteInput}
        options={users}
      />
      <Field
        type="text"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.MODEL}
        label={Label.MODEL}
        name="model"
        as={AutocompleteInput}
        options={models}
      />
      <Field
        type="text"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.FACADE}
        label={Label.FACADE}
        name="facade"
        as={AutocompleteInput}
        options={facades}
      />
      <Field
        type="text"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.METHOD}
        label={Label.METHOD}
        name="method"
        as={AutocompleteInput}
        options={methods}
      />
      <Field
        type="number"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.VERSION}
        label={Label.VERSION}
        name="version"
        as={Input}
      />
    </>
  );
};

export default Fields;
