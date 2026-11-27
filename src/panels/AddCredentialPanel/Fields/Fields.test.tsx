import { screen } from "@testing-library/react";
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
              regions: [
                { name: "us-east-1", endpoint: "" },
                { name: "us-west-2", endpoint: "" },
              ],
            },
            "cloud-gce": {
              type: "gce",
              regions: [
                { name: "us-central1", endpoint: "" },
                { name: "us-east1", endpoint: "" },
              ],
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

    // Region should be cleared
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
});
