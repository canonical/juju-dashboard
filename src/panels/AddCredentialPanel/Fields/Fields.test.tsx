// spell-checker:ignore userpass

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Fields from "./Fields";
import { FieldName, Label, type FormFields } from "./types";

describe("AddCredentialPanel Fields", () => {
  let state: RootState;
  let initialValues: FormFields;

  beforeEach(() => {
    initialValues = {
      [FieldName.NAME]: "",
      [FieldName.CLOUD]: "",
      [FieldName.REGION]: "",
      [FieldName.AUTH_TYPE]: "",
      [FieldName.AUTH_ATTRS]: {},
    };
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": {
              type: "ec2",
              "auth-types": ["access-key"],
              regions: [
                { name: "us-east-1", endpoint: "" },
                { name: "us-west-2", endpoint: "" },
              ],
            },
            "cloud-gce": {
              type: "gce",
              "auth-types": ["oauth2", "jsonfile"],
              regions: [
                { name: "us-central1", endpoint: "" },
                { name: "us-east1", endpoint: "" },
              ],
            },
            "cloud-azure": {
              type: "azure",
              "auth-types": ["service-principal-secret", "managed-identity"],
              regions: [{ name: "region-1", endpoint: "" }],
            },
            "cloud-mycloud": {
              type: "openstack",
              "auth-types": ["userpass", "interactive"],
              regions: [],
            },
            "cloud-manual": {
              type: "manual",
              "auth-types": ["empty"],
              regions: [],
            },
            "cloud-unknown": {
              type: "unknown",
              "auth-types": ["unknown-auth"],
              regions: [],
            },
          },
        }),
      }),
    });
  });

  it("renders cloud options from cloud info", () => {
    renderComponent(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );

    const cloudSelect = screen.getByRole("combobox", { name: Label.CLOUD });
    expect(cloudSelect).toBeInTheDocument();

    // Check that cloud options are available
    expect(screen.getByRole("option", { name: "aws" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "gce" })).toBeInTheDocument();
  });

  it("disables region field when no cloud is selected", () => {
    renderComponent(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );

    const regionSelect = screen.getByRole("combobox", { name: Label.REGION });
    expect(regionSelect).toBeDisabled();
  });

  it("populates region options when cloud is selected", async () => {
    renderComponent(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: Label.CLOUD }),
      "cloud-aws",
    );

    expect(
      screen.getByRole("combobox", { name: Label.REGION }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole("option", { name: "us-east-1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "us-west-2" }),
    ).toBeInTheDocument();
  });

  it("clears region when cloud selection changes", async () => {
    renderComponent(
      <Formik<FormFields>
        initialValues={{
          ...initialValues,
          [FieldName.CLOUD]: "cloud-aws",
          [FieldName.REGION]: "us-east-1",
        }}
        onSubmit={vi.fn()}
      >
        <Fields />
      </Formik>,
      { state },
    );

    const regionSelect = screen.getByRole("combobox", { name: Label.REGION });

    // Region should have a value initially
    expect(regionSelect).toHaveValue("us-east-1");

    // Change cloud selection
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: Label.CLOUD }),
      "cloud-gce",
    );

    // Region should be cleared (empty option selected)
    expect(regionSelect).toHaveValue("");
  });

  it("shows different regions for different clouds", async () => {
    renderComponent(
      <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );

    const cloudSelect = screen.getByRole("combobox", { name: Label.CLOUD });

    // Select AWS
    await userEvent.selectOptions(cloudSelect, "cloud-aws");
    expect(
      screen.getByRole("option", { name: "us-east-1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "us-central1" }),
    ).not.toBeInTheDocument();

    // Switch to GCE
    await userEvent.selectOptions(cloudSelect, "cloud-gce");
    expect(
      screen.getByRole("option", { name: "us-central1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "us-east-1" }),
    ).not.toBeInTheDocument();
  });

  describe("auth types", () => {
    it("selects the first auth type and renders its fields when a cloud is selected", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.CLOUD }),
        "cloud-gce",
      );

      const authTypeSelect = screen.getByRole("combobox", {
        name: Label.AUTH_TYPE,
      });
      expect(authTypeSelect).toHaveValue("oauth2");

      // Confirm that the auth-type's fields are rendered correctly
      expect(
        within(authTypeSelect)
          .getAllByRole("option")
          .map((option) => option.textContent),
      ).toStrictEqual(["oauth2", "jsonfile"]);
      expect(
        screen.getByRole("textbox", { name: /Client ID/ }),
      ).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /Private Key/ }).tagName).toBe(
        "TEXTAREA",
      );
    });

    it("swaps the auth fields and clears their values when the auth type changes", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.CLOUD }),
        "cloud-azure",
      );

      // Confirm that the initial auth type is selected correctly
      expect(
        screen.getByRole("combobox", { name: Label.AUTH_TYPE }),
      ).toHaveValue("service-principal-secret");
      await userEvent.type(
        screen.getByRole("textbox", { name: /^Subscription ID/ }),
        "sub-1",
      );
      expect(
        screen.getByRole("textbox", { name: /Application ID/ }),
      ).toBeInTheDocument();

      // Change the auth type and confirm that the fields are swapped correctly
      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.AUTH_TYPE }),
        "managed-identity",
      );
      expect(
        screen.queryByRole("textbox", { name: /Application ID/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /Managed Identity Path/ }),
      ).toBeInTheDocument();
      // Subscription ID is in both auth types, but the entered value must not carry over.
      expect(
        screen.getByRole("textbox", { name: /^Subscription ID/ }),
      ).toHaveValue("");
    });

    it("resets the auth type and clears the auth values when the cloud changes", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      const cloudSelect = screen.getByRole("combobox", { name: Label.CLOUD });
      const authTypeSelect = screen.getByRole("combobox", {
        name: Label.AUTH_TYPE,
      });

      // Select a cloud and fill in its auth-type field
      await userEvent.selectOptions(cloudSelect, "cloud-aws");
      await userEvent.type(
        screen.getByRole("textbox", { name: /Access Key/ }),
        "key",
      );

      // Change the cloud selection
      await userEvent.selectOptions(cloudSelect, "cloud-gce");
      expect(authTypeSelect).toHaveValue("oauth2");

      // Switch back to the initial cloud and confirm the fields have been reset
      await userEvent.selectOptions(cloudSelect, "cloud-aws");
      expect(authTypeSelect).toHaveValue("access-key");
      expect(screen.getByRole("textbox", { name: /Access Key/ })).toHaveValue(
        "",
      );
    });

    it("clears the auth type and fields when the empty cloud option is selected", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      const cloudSelect = screen.getByRole("combobox", { name: Label.CLOUD });
      const authTypeSelect = screen.getByRole("combobox", {
        name: Label.AUTH_TYPE,
      });

      await userEvent.selectOptions(cloudSelect, "cloud-aws");
      expect(
        screen.getByRole("textbox", { name: /Access Key/ }),
      ).toBeInTheDocument();

      await userEvent.selectOptions(cloudSelect, "");
      // With no cloud there are no auth type options, so there is nothing to select.
      expect(within(authTypeSelect).queryAllByRole("option")).toHaveLength(0);
      expect(authTypeSelect).toBeDisabled();
      expect(
        screen.queryByRole("textbox", { name: /Access Key/ }),
      ).not.toBeInTheDocument();
    });

    it("uses the cloud's type and supported auth types for a custom cloud", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.CLOUD }),
        "cloud-mycloud",
      );

      // "interactive" is supported by the cloud but there are no fields for it.
      expect(
        within(screen.getByRole("combobox", { name: Label.AUTH_TYPE }))
          .getAllByRole("option")
          .map((option) => option.textContent),
      ).toStrictEqual(["userpass"]);
      expect(
        screen.getByRole("textbox", { name: /Username/ }),
      ).toBeInTheDocument();
    });

    it("hides the authentication details for unmanaged/manual clouds", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      // The authentication details should be visible initially.
      expect(screen.getByText(Label.AUTH_DETAILS)).toBeInTheDocument();

      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.CLOUD }),
        "cloud-manual",
      );

      expect(screen.queryByText(Label.AUTH_DETAILS)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("combobox", { name: Label.AUTH_TYPE }),
      ).not.toBeInTheDocument();
    });

    it("renders no auth fields for a cloud without an auth schema", async () => {
      renderComponent(
        <Formik<FormFields> initialValues={initialValues} onSubmit={vi.fn()}>
          <Fields />
        </Formik>,
        { state },
      );

      await userEvent.selectOptions(
        screen.getByRole("combobox", { name: Label.CLOUD }),
        "cloud-unknown",
      );
      expect(
        within(
          screen.getByRole("combobox", { name: Label.AUTH_TYPE }),
        ).queryAllByRole("option"),
      ).toHaveLength(0);
      // Only the credential name field is left.
      expect(screen.getAllByRole("textbox")).toHaveLength(1);
    });
  });
});
