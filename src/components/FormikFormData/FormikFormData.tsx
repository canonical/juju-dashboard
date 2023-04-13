import type { ValueOf } from "@canonical/react-components";
import { Form, useFormikContext } from "formik";
import type { ReactNode } from "react";
import { useEffect } from "react";

export type SetFieldValue<V> = (fieldName: string, value: ValueOf<V>) => void;

type Props<V> = {
  children: ReactNode;
  onFormChange: (data: V) => void;
  onSetup: (setFieldValue: SetFieldValue<V>) => void;
};

export default function FormikFormData<V>({
  children,
  onFormChange,
  onSetup,
}: Props<V>): JSX.Element {
  const { values, setFieldValue } = useFormikContext<V>();

  useEffect(() => {
    onSetup(setFieldValue);
  }, [onSetup, setFieldValue]);

  useEffect(() => {
    onFormChange(values);
  }, [onFormChange, values]);

  return <Form>{children}</Form>;
}
