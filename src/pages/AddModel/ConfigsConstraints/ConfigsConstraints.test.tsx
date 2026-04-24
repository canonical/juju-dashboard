import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";
import { externalURLs } from "urls";

import ConfigsConstraints from "./ConfigsConstraints";
import { InputMode } from "./ContentSwitcher/types";
import { DisableType, Label } from "./types";

describe("ConfigsConstraints", () => {
  it("renders properly", () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByRole("radio", { name: InputMode.LIST })).toBeChecked();
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

    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));

    expect(
      screen.queryByLabelText("container-networking-method"),
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

    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toContain("default-space: my-space");
  });

  it("regenerates YAML to include newly changed categories", async () => {
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

    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));

    let textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toContain("# Networking & Firewall");
    expect(textarea.value).not.toContain("# Proxy & Mirror");

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));
    const aptHttpProxyInput = document.querySelector(
      'input[name="apt-http-proxy"]',
    ) as HTMLInputElement;
    await userEvent.type(aptHttpProxyInput, "http://proxy.example");
    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));

    textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    expect(textarea.value).toContain("# Networking & Firewall");
    expect(textarea.value).toContain("default-space: my-space");
    expect(textarea.value).toContain("# Proxy & Mirror");
    expect(textarea.value).toContain("apt-http-proxy: http://proxy.example");
  });

  it("hides unchanged rows when changed-configs-only is toggled on", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    expect(
      screen.getByLabelText("container-networking-method"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY));
    expect(
      screen.queryByLabelText("container-networking-method"),
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

    expect(
      screen.getByLabelText("container-networking-method"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("default-space")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY));
    expect(
      screen.queryByLabelText("container-networking-method"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("default-space")).toBeInTheDocument();
  });

  it("initialises in YAML mode when configInputMode is yaml", () => {
    renderComponent(
      <Formik
        initialValues={{ configInputMode: InputMode.YAML }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    expect(screen.getByRole("radio", { name: InputMode.YAML })).toBeChecked();
    expect(
      screen.getByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).toBeInTheDocument();
  });

  it("renders disabled command options with 'none' selected by default", () => {
    renderComponent(
      <Formik
        initialValues={{ disabledCommands: DisableType.NONE }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    expect(
      screen.getByRole("heading", { name: Label.DISABLED_COMMANDS }),
    ).toBeInTheDocument();
    const docsLink = screen.getByRole("link", {
      name: Label.DISABLE_COMMANDS_DOCS,
    });
    expect(docsLink).toHaveAttribute("href", externalURLs.disableCommand);

    expect(screen.getByRole("radio", { name: "None" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_DESTROY_MODEL }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_REMOVE_OBJECT }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    ).not.toBeChecked();
  });

  it("allows selecting a different option", async () => {
    renderComponent(
      <Formik
        initialValues={{ disabledCommands: DisableType.NONE }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    );

    expect(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    ).toBeChecked();
  });
});
