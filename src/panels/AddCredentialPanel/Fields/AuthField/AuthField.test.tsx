import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import { MAX_FILE_SIZE } from "consts";

import { FieldName, type FormFields } from "../types";

import AuthField from "./AuthField";
import { Label } from "./types";

describe("AuthField", () => {
  let initialValues: FormFields;

  beforeEach(() => {
    initialValues = {
      [FieldName.NAME]: "",
      [FieldName.CLOUD]: "",
      [FieldName.REGION]: "",
      [FieldName.AUTH_TYPE]: "",
      [FieldName.AUTH_ATTRS]: { key: "", secret: "", cert: "", file: "" },
    };
  });

  it("renders a text input", () => {
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <AuthField
          field={{
            name: "key",
            label: "Key",
            inputType: "text",
            optional: false,
          }}
        />
      </Formik>,
    );
    const input = screen.getByRole("textbox", { name: /Key/ });
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("renders a password input", () => {
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <AuthField
          field={{
            name: "secret",
            label: "Secret",
            inputType: "password",
            optional: false,
            sensitive: true,
          }}
        />
      </Formik>,
    );
    const input = screen.getByLabelText(/Secret/);
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "new-password");
  });

  it("renders a textarea", () => {
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <AuthField
          field={{
            name: "cert",
            label: "Certificate",
            inputType: "textarea",
            optional: true,
            sensitive: true,
          }}
        />
      </Formik>,
    );
    const input = screen.getByRole("textbox", {
      name: "Certificate (optional)",
    });
    expect(input.tagName).toBe("TEXTAREA");
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
  });

  it("renders a file input", () => {
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <AuthField
          field={{
            name: "file",
            label: "Key file",
            inputType: "file",
            optional: false,
            format: "json",
          }}
        />
      </Formik>,
    );
    expect(screen.getByLabelText(/Key file/)).toHaveAttribute("type", "file");
  });

  it("stores the contents of an uploaded file as the field value", async () => {
    let values: FormFields | undefined;
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        {(formik) => {
          ({ values } = formik);
          return (
            <AuthField
              field={{
                name: "file",
                label: "Key file",
                inputType: "file",
                optional: false,
                format: "json",
              }}
            />
          );
        }}
      </Formik>,
    );
    await userEvent.upload(
      screen.getByLabelText(/Key file/),
      new File(['{"a": 1}'], "key.json", { type: "application/json" }),
    );
    await waitFor(() => {
      expect(values?.[FieldName.AUTH_ATTRS].file).toBe('{"a": 1}');
    });
  });

  it("shows an error and ignores files that are too large", async () => {
    let values: FormFields | undefined;
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        {(formik) => {
          ({ values } = formik);
          return (
            <AuthField
              field={{
                name: "file",
                label: "Key file",
                inputType: "file",
                optional: false,
                format: "json",
              }}
            />
          );
        }}
      </Formik>,
    );
    await userEvent.upload(
      screen.getByLabelText(/Key file/),
      new File([new ArrayBuffer(MAX_FILE_SIZE + 1)], "key.json", {
        type: "application/json",
      }),
    );
    expect(await screen.findByText(Label.FILE_TOO_LARGE)).toBeInTheDocument();
    expect(values?.[FieldName.AUTH_ATTRS].file).toBe("");
  });

  it("shows an error if the file can't be read", async () => {
    render(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <AuthField
          field={{
            name: "file",
            label: "Key file",
            inputType: "file",
            optional: false,
            format: "json",
          }}
        />
      </Formik>,
    );
    const file = new File(["{}"], "key.json", { type: "application/json" });
    vi.spyOn(file, "text").mockRejectedValue(new Error("Unreadable"));
    await userEvent.upload(screen.getByLabelText(/Key file/), file);
    expect(await screen.findByText(Label.FILE_UNREADABLE)).toBeInTheDocument();
  });
});
