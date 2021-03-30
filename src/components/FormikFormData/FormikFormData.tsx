import { ReactNode } from "react";
import { Form, useFormikContext } from "formik";

type OptionValue = {
  [key: string]: string;
};

type Props = {
  children: ReactNode;
  onFormChange: (data: OptionValue) => void;
};

export default function FormikForm({
  children,
  onFormChange,
}: Props): JSX.Element {
  const { values: formikContext } = useFormikContext<OptionValue>();
  onFormChange(formikContext);
  return <Form>{children}</Form>;
}
