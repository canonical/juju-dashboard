import type { FormProps } from "@canonical/react-components";
import { Form } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX, ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { SetFieldValue } from "./types";

type Props<V> = {
  children: ReactNode;
  onFormChange?: (data: V) => void;
  onSetup?: (setFieldValue: SetFieldValue<V>) => void;
  onValidate?: (valid: boolean) => void;
  skipFirstValidation?: boolean;
} & FormProps;

export default function FormikFormData<V>({
  children,
  onFormChange,
  onSetup,
  onValidate,
  skipFirstValidation = true,
  ...props
}: Props<V>): JSX.Element {
  const { values, setFieldValue, isValid, handleReset, handleSubmit } =
    useFormikContext<V>();

  useEffect(() => {
    onSetup?.(setFieldValue);
  }, [onSetup, setFieldValue]);

  useEffect(() => {
    onFormChange?.(values);
  }, [onFormChange, values]);

  // HACK: Formik will always mark the form as valid on first render, even if it's not. This skips
  // the first (incorrect) validation.
  const initialValidate = useRef(skipFirstValidation);
  useEffect(() => {
    if (initialValidate.current) {
      initialValidate.current = false;
      return;
    }

    onValidate?.(isValid);
  }, [onValidate, isValid]);

  return (
    <Form onReset={handleReset} onSubmit={handleSubmit} role="form" {...props}>
      {children}
    </Form>
  );
}
