import type { FormikProps } from "formik";

export enum TestId {
  ActionForm = "action-form",
}

export type FormRef = FormikProps<Record<string, boolean | string>> | null;
