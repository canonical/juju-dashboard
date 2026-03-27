import type { FormikFieldProps } from "@canonical/react-components";
import { FormikField } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import AutocompleteInput from "components/AutocompleteInput";

export type AutocompleteInputItem = {
  label: string;
  value: number | string;
};

const AutocompleteField: FC<FormikFieldProps<typeof AutocompleteInput>> = ({
  name,
  ...props
}) => {
  const { setFieldValue } = useFormikContext();
  return (
    <FormikField
      {...props}
      name={name}
      component={AutocompleteInput}
      onValueChanged={(value) => {
        void setFieldValue(name, value);
      }}
    />
  );
};

export default AutocompleteField;
