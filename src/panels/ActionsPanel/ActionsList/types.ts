export type FormControlRef = {
  /** Submit the form. */
  submitForm: () => Promise<void>;
  /** Produce the current values of the form. */
  get values(): null | Record<string, boolean | string>;
};
