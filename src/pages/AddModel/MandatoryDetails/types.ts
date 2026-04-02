import type { AddModelFormState } from "../types";

export enum TestId {
  MANDATORY_DETAILS_FORM = "mandatory-details-form",
}

export type Props = {
  initialValues: AddModelFormState | null;
  onFormChange: (values: AddModelFormState) => void;
};
