import type { ValueOf } from "@canonical/react-components";
import type { FormikErrors } from "formik";

export type SetFieldValue<V> = (
  fieldName: string,
  value: ValueOf<V>,
) => Promise<void | FormikErrors<V>>;
