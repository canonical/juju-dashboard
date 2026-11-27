import { FormikField, Input, Textarea } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { ChangeEvent, JSX } from "react";
import { useState } from "react";

import { MAX_FILE_SIZE } from "consts";

import { FieldName, type AuthTypeField, type FormFields } from "../types";

import { Label } from "./types";

const AuthField = ({ field }: { field: AuthTypeField }): JSX.Element => {
  const { setFieldValue, setFieldTouched, getFieldMeta } =
    useFormikContext<FormFields>();
  const name = `${FieldName.AUTH_ATTRS}.${field.name}`;
  const label = field.optional ? `${field.label} (optional)` : field.label;
  const required = !field.optional;

  // File problems aren't part of the form values (a rejected file is stored as an empty value) so
  // they are kept here, as Formik's errors are replaced every time the form is validated.
  const [fileError, setFileError] = useState<string>();

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const input = event.target;
    const file = input.files?.[0];
    let contents = "";
    setFileError(undefined);
    if (file && file.size > MAX_FILE_SIZE) {
      setFileError(Label.FILE_TOO_LARGE);
    } else if (file) {
      try {
        contents = await file.text();
      } catch {
        setFileError(Label.FILE_UNREADABLE);
      }
    }
    if (file && !contents) {
      // Don't keep displaying the name of a file that wasn't used.
      input.value = "";
    }
    await setFieldValue(name, contents);
    // Setting the value already validates, so skip validating again with stale values.
    void setFieldTouched(name, true, false);
  };

  switch (field.inputType) {
    case "file": {
      // File inputs can't be controlled and the browser only exposes a fake path as the value,
      // so the file contents are read and stored in the form instead.
      const { touched, error } = getFieldMeta(name);
      let errorMessage: null | string | undefined = null;
      if (fileError) {
        // A problem with the chosen file takes priority over the validation error.
        errorMessage = fileError;
      } else if (touched) {
        errorMessage = error;
      }
      return (
        <Input
          // The only file field is currently a JSON key file. When other file types (e.g. PEM) are
          // added, this should become a mapping from the field's format to the accepted types.
          accept=".json,application/json"
          error={errorMessage}
          label={label}
          name={name}
          // Formik only wires up blur handling for FormikFields, so mark the field as touched here.
          // Without this the required error wouldn't display if the user leaves without picking a
          // file.
          onBlur={() => void setFieldTouched(name, true)}
          onChange={(event) => void handleFileChange(event)}
          required={required}
          type="file"
        />
      );
    }
    case "textarea":
      return (
        <FormikField
          // Sensitive values (e.g. private keys) shouldn't be sent to a browser's spellchecking
          // service.
          autoComplete="off"
          component={Textarea}
          label={label}
          name={name}
          required={required}
          spellCheck={!field.sensitive}
        />
      );
    case "password":
    case "text":
      return (
        <FormikField
          // These are cloud credentials, so stop the browser from filling in (or offering to save)
          // the user's own saved logins.
          autoComplete={field.sensitive ? "new-password" : "off"}
          label={label}
          name={name}
          required={required}
          type={field.inputType}
        />
      );
  }
};

export default AuthField;
