import { Input } from "@canonical/react-components";
import { useField } from "formik";
import {
  useId,
  type ComponentProps,
  type ComponentType,
  type ElementType,
  type HTMLProps,
} from "react";

export type Props<C extends ElementType | ComponentType = typeof Input> = {
  component?: C;
  displayError?: boolean;
  name: string;
  value?: HTMLProps<HTMLElement>["value"];
} & ComponentProps<C>;

const FormikField = <C extends ElementType | ComponentType = typeof Input>({
  component: Component = Input,
  displayError = true,
  name,
  value,
  label,
  ...props
}: Props<C>): JSX.Element => {
  const id = useId();
  const [field, meta] = useField({ name, type: props.type, value });

  return (
    <Component
      aria-label={label}
      error={meta.touched && displayError ? meta.error : null}
      // Have to manually set the id until this issue has been fixed:
      // https://github.com/canonical/react-components/issues/957
      id={id}
      label={label}
      {...field}
      {...props}
    />
  );
};

export default FormikField;
