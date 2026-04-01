import type { FormikProps } from "formik";
import type { Ref } from "react";

import type { AddModelFormState } from "../types";

export enum TestId {
  MANDATORY_DETAILS_FORM = "mandatory-details-form",
}

export type Props = {
  formRef: Ref<FormikProps<AddModelFormState>>;
  initialValues: AddModelFormState | null;
  onSubmit: () => void;
};
