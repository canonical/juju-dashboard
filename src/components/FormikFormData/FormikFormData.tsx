import { ReactNode, useEffect } from "react";
import { Form, useFormikContext } from "formik";

export type SetFieldValue = (fieldName: string, value: any) => void;

type Props = {
  children: ReactNode;
  onFormChange: (data: any) => void;
  onSetup: (setFieldValue: SetFieldValue) => void;
};

export default function FormikFormData({
  children,
  onFormChange = () => {},
  onSetup = () => {},
}: Props): JSX.Element {
  const { values, setFieldValue } = useFormikContext<any>();

  useEffect(() => {
    onSetup(setFieldValue);
  }, [onSetup, setFieldValue]);

  useEffect(() => {
    onFormChange(values);
  }, [onFormChange, values]);

  return <Form>{children}</Form>;
}
