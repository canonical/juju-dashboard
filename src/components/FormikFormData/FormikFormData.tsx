import { ReactNode, useEffect } from "react";
import { Form, useFormikContext } from "formik";

type OptionValue = {
  [key: string]: string;
};

type Props = {
  children: ReactNode;
  onFormChange: (data: OptionValue) => void;
  onSetup: (setFieldValue: any) => void;
};

export default function FormikFormData({
  children,
  onFormChange,
  onSetup,
}: Props): JSX.Element {
  const { values, setFieldValue } = useFormikContext<OptionValue>();

  useEffect(() => {
    onSetup(setFieldValue);
  }, [onSetup, setFieldValue]);

  // To avoid the error about setting state during render bump the
  // callback call until the rendering has been completed.
  setTimeout(() => {
    onFormChange(values);
  });

  return <Form>{children}</Form>;
}
