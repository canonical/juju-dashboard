export enum Label {
  CANCEL_CONFIRM = "Are you sure you wish to cancel?",
  CANCEL_CONFIRM_CANCEL_BUTTON = "Continue editing",
  CANCEL_CONFIRM_CONFIRM_BUTTON = "Yes, I'm sure",
  GRANT_CANCEL_BUTTON = "No",
  GRANT_CONFIRM = "Grant secrets?",
  GRANT_CONFIRM_BUTTON = "Yes",
  GRANT_ERROR = "Unable to grant application access to secrets.",
  SAVE_CONFIRM = "Are you sure you wish to apply these changes?",
  SAVE_CONFIRM_CANCEL_BUTTON = "Cancel",
  SAVE_CONFIRM_CONFIRM_BUTTON = "Yes, apply changes",
  SUBMIT_TO_JUJU_ERROR = "Unable to submit config changes to Juju.",
}

export enum InlineErrors {
  FORM = "form",
  SUBMIT_TO_JUJU = "submit-to-juju",
}
