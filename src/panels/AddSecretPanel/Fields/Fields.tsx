import { Button, Icon, Select, Textarea } from "@canonical/react-components";
import { FieldArray, useFormikContext } from "formik";

import FormikField from "components/FormikField/FormikField";

import type { FormFields } from "../types";
import { RotatePolicy } from "../types";

export enum Label {
  ADD = "Add key/value pair",
  DESCRIPTION = "Description",
  EXPIRY_TIME = "Expiry time",
  IS_BASE_64 = "Value is base64 encoded",
  KEY = "Key",
  LABEL = "Label",
  REMOVE = "Remove",
  ROTATE_POLICY = "Rotate policy",
  VALUE = "Value",
}

const Fields = (): JSX.Element => {
  const { values } = useFormikContext<FormFields>();

  return (
    <>
      <FormikField label={Label.LABEL} name="label" type="text" />
      <FormikField
        label={Label.DESCRIPTION}
        name="description"
        component={Textarea}
      />
      <FormikField
        type="datetime-local"
        label={Label.EXPIRY_TIME}
        name="expiryTime"
      />
      <FormikField
        label={Label.ROTATE_POLICY}
        name="rotatePolicy"
        component={Select}
        options={Object.values(RotatePolicy).map((option) => ({
          label: option,
          value: option,
        }))}
      />
      <h5>Secret key/value pairs</h5>
      <FieldArray
        name="pairs"
        render={(arrayHelpers) => (
          <>
            {values.pairs.map((pair, index) => (
              <fieldset key={index}>
                <FormikField
                  label={`${Label.KEY} ${index + 1}`}
                  name={`pairs.${index}.key`}
                  type="text"
                  required
                />
                <FormikField
                  label={`${Label.VALUE} ${index + 1}`}
                  name={`pairs.${index}.value`}
                  component={Textarea}
                  required
                />
                <FormikField
                  id={Label.IS_BASE_64}
                  label={Label.IS_BASE_64}
                  name={`pairs.${index}.isBase64`}
                  type="checkbox"
                />

                <Button
                  className="u-no-margin--bottom"
                  disabled={values.pairs.length <= 1}
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    arrayHelpers.remove(index);
                  }}
                  hasIcon
                >
                  <Icon name="minus" />
                  <span>{Label.REMOVE}</span>
                </Button>
              </fieldset>
            ))}
            <Button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                arrayHelpers.push({ key: "", value: "", isBase64: false });
              }}
              hasIcon
            >
              <Icon name="plus" />
              <span>{Label.ADD}</span>
            </Button>
          </>
        )}
      />
    </>
  );
};

export default Fields;
