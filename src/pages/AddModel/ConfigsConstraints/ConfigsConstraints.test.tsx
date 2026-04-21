import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import ConfigsConstraints from "./ConfigsConstraints";
import { Label } from "./types";

describe("ConfigsConstraints", () => {
  it("renders properly", () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByLabelText("List")).toBeChecked();
    expect(
      screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY),
    ).toBeInTheDocument();
  });
  it("hides the table and shows the textarea on switching to YAML mode", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(screen.getByLabelText("YAML"));

    expect(
      screen.queryByText("container-networking-method"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).toBeInTheDocument();
  });

  it("pre-populates the textarea with changed list values", async () => {
    renderComponent(
      <Formik
        initialValues={{ "default-space": "my-space" }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(screen.getByLabelText("YAML"));

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toContain("default-space: my-space");
  });

  it("does not overwrite existing YAML the user already typed", async () => {
    renderComponent(
      <Formik
        initialValues={{
          configYAML: "custom: value",
          "default-space": "my-space",
        }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(screen.getByLabelText("YAML"));

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("custom: value");
  });

  it("hides unchanged rows when changed-configs-only is toggled on", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByText("container-networking-method")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY));

    expect(
      screen.queryByText("container-networking-method"),
    ).not.toBeInTheDocument();
  });

  it("shows a changed row when toggled on", async () => {
    renderComponent(
      <Formik
        initialValues={{
          "default-space": "my-space",
        }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByText("container-networking-method")).toBeInTheDocument();
    expect(screen.getByText("default-space")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY));

    expect(
      screen.queryByText("container-networking-method"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("default-space")).toBeInTheDocument();
  });

  it("initialises in YAML mode when configInputMode is yaml", () => {
    renderComponent(
      <Formik initialValues={{ configInputMode: "yaml" }} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByLabelText("YAML")).toBeChecked();
    expect(
      screen.getByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).toBeInTheDocument();
  });
});
