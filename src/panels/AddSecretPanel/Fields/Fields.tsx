import { Input, Select, Textarea } from "@canonical/react-components";
import { Field } from "formik";

import { RotatePolicy } from "../types";

export enum Label {
  CONTENT = "Content",
  DESCRIPTION = "Description",
  EXPIRY_TIME = "Expiry time",
  IS_BASE_64 = "Is base64 encoded",
  LABEL = "Label",
  ROTATE_POLICY = "Rotate policy",
}

const Fields = (): JSX.Element => {
  return (
    <>
      <Field
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.LABEL}
        label={Label.LABEL}
        name="label"
        as={Input}
        type="text"
      />
      <Field
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.DESCRIPTION}
        label={Label.DESCRIPTION}
        name="description"
        as={Textarea}
      />
      <Field
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.CONTENT}
        label={Label.CONTENT}
        name="content"
        as={Textarea}
      />
      <Field
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.IS_BASE_64}
        label={Label.IS_BASE_64}
        name="isBase64"
        as={Input}
        type="checkbox"
      />
      <Field
        type="datetime-local"
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.EXPIRY_TIME}
        label={Label.EXPIRY_TIME}
        name="expire-time"
        as={Input}
      />
      <Field
        // Have to manually set the id until this issue has been fixed:
        // https://github.com/canonical/react-components/issues/957
        id={Label.ROTATE_POLICY}
        label={Label.ROTATE_POLICY}
        name="rotate-policy"
        as={Select}
        options={Object.values(RotatePolicy).map((option) => ({
          label: option,
          value: option,
        }))}
      />
    </>
  );
};

export default Fields;
