import { FormikField } from "@canonical/react-components";
import { Formik } from "formik";
import type React from "react";
import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type JSX,
} from "react";
import * as Yup from "yup";

import FormikFormData from "components/FormikFormData";

import type { FormRef } from "./types";
import { TestId } from "./types";

type Property = {
  name: string;
  description: string;
  type: string;
  required: boolean;
};

type Props = {
  /** Properties required to submit the action. */
  properties: Property[];
  /** Reference to the underlying Formik form. */
  formRef?: React.Ref<FormRef>;
  /** Callback when the form is submitted (such as by pressing Enter). */
  onSubmit?: (properties: Record<string, boolean | string>) => void;
  /** Callback when the validation state of the form changes. */
  onValidate?: (valid: boolean) => void;
};

/**
 * A form rendering the properties on an action.
 */
export default function ActionForm({
  properties,
  formRef,
  onSubmit,
  onValidate,
}: Props): JSX.Element {
  // Allow for the `formikRef` to be used within and outside this component.
  const formikRef = useRef<FormRef>(null);
  useImperativeHandle<FormRef, FormRef>(formRef, () => {
    return formikRef.current;
  }, []);

  // Ensure fields default to empty.
  const initialValues = useMemo(
    () =>
      properties.reduce(
        (values, property) => {
          values[property.name] = property.type === "boolean" ? false : "";
          return values;
        },
        {} as Record<string, boolean | string>,
      ),
    [properties],
  );

  // Dynamically build a validation schema.
  const validationSchema = useMemo(
    () =>
      Yup.object(
        Object.fromEntries(
          properties.map((property) => {
            let fieldSchema: Yup.StringSchema = Yup.string();

            if (property.required) {
              fieldSchema = fieldSchema.required(
                `${property.name} is a required field`,
              );
            }

            return [property.name, fieldSchema];
          }),
        ),
      ),
    [properties],
  );

  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
      if (
        ev.key !== "Enter" ||
        // Only allow Enter navigation on text fields
        ev.currentTarget.type !== "text"
      ) {
        return;
      }
      // Sometimes Formik will automatically submit if there's only one field.
      ev.preventDefault();
      const { form } = ev.currentTarget;
      if (!form) {
        return;
      }
      if (currentIndex === properties.length - 1) {
        // Reached end of list, allow form submission.
        void formikRef.current?.submitForm();
        return;
      }
      // Find the next field, and focus it.
      const nextField = form.querySelectorAll("input")[currentIndex + 1];
      nextField?.focus();
    },
    [properties],
  );

  return (
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      onSubmit={(values) => onSubmit?.(values)}
      validationSchema={validationSchema}
      validateOnChange
      validateOnMount
    >
      <FormikFormData data-testid={TestId.ActionForm} onValidate={onValidate}>
        {properties.map((property, i) => (
          <FormikField
            type={property.type === "boolean" ? "checkbox" : "text"}
            id={property.name}
            name={property.name}
            key={property.name}
            label={property.name}
            help={property.description}
            required={property.required}
            onKeyDown={(ev) => {
              handleKeyDown(ev, i);
            }}
          />
        ))}
      </FormikFormData>
    </Formik>
  );
}
