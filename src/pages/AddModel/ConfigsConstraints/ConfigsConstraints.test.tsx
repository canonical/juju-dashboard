import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import ConfigsConstraints from "./ConfigsConstraints";
import { InputMode } from "./ContentSwitcher/types";
import { Label } from "./types";

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

  it("merges YAML edits back into list values when switching to list", async () => {
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

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(
      textarea,
      [
        "# Networking & Firewall",
        "default-space: my-space",
        "",
        "# Proxy & Mirror",
        "apt-http-proxy: http://proxy.example",
      ].join("\n"),
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));

    const defaultSpaceInput = document.querySelector(
      'input[name="default-space"]',
    ) as HTMLInputElement;
    const aptHttpProxyInput = document.querySelector(
      'input[name="apt-http-proxy"]',
    ) as HTMLInputElement;

    expect(defaultSpaceInput.value).toBe("my-space");
    expect(aptHttpProxyInput.value).toBe("http://proxy.example");
  });

  it("shows a validation dialog and stays in YAML mode for invalid YAML", async () => {
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

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(
      textarea,
      [
        "# Networking & Firewall",
        "container-networking-method: not-a-valid-option",
        "bad-line-without-colon",
      ].join("\n"),
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));

    expect(
      screen.getByRole("dialog", { name: "Invalid configuration YAML" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Line 2:/)).toBeInTheDocument();
    expect(screen.getByText(/Line 3:/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: InputMode.YAML })).toBeChecked();
  });

  it("clears removed YAML fields when switching back to list", async () => {
    renderComponent(
      <Formik
        initialValues={{
          "default-space": "my-space",
          "apt-http-proxy": "http://proxy.example",
        }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(
      textarea,
      ["# Proxy & Mirror", "apt-http-proxy: http://proxy.example"].join(
        "\n",
      ),
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));

    const defaultSpaceInput = document.querySelector(
      'input[name="default-space"]',
    ) as HTMLInputElement;
    const aptHttpProxyInput = document.querySelector(
      'input[name="apt-http-proxy"]',
    ) as HTMLInputElement;

    expect(defaultSpaceInput.value).toBe("");
    expect(aptHttpProxyInput.value).toBe("http://proxy.example");

    await userEvent.click(screen.getByLabelText(Label.CHANGED_CONFIGS_ONLY));
    expect(screen.queryByText("default-space")).not.toBeInTheDocument();
    expect(screen.getByText("apt-http-proxy")).toBeInTheDocument();
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
});
