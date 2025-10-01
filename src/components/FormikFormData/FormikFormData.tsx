import { Form, useFormikContext } from "formik";
import type { HTMLProps, JSX, ReactNode } from "react";
import { useEffect, useRef } from "react";

import type { SetFieldValue } from "./types";

type Props<V> = {
  children: ReactNode;
  onFormChange?: (data: V) => void;
  onSetup?: (setFieldValue: SetFieldValue<V>) => void;
  onValidate?: (valid: boolean) => void;
} & HTMLProps<HTMLFormElement>;

export default function FormikFormData<V>({
  children,
  onFormChange,
  onSetup,
  onValidate,
  ...props
}: Props<V>): JSX.Element {
  const { values, setFieldValue, isValid } = useFormikContext<V>();

  useEffect(() => {
    onSetup?.(setFieldValue);
  }, [onSetup, setFieldValue]);

  useEffect(() => {
    onFormChange?.(values);
  }, [onFormChange, values]);

  // HACK: Formik will always mark the form as valid on first render, even if it's not. This skips
  // the first (incorrect) validation.
  const initialValidate = useRef(true);
  useEffect(() => {
    if (initialValidate.current) {
      initialValidate.current = false;
      return;
    }

    onValidate?.(isValid);
  }, [onValidate, isValid]);

  return <Form {...props}>{children}</Form>;
}
