import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import { externalURLs } from "urls";

import { InputMode } from "../../types";
import { CONFIG_CATEGORIES } from "../configCatalog";
import { FieldName, Label } from "../types";

import CategoriesListing from "./CategoriesListing";
import type { Props as CategoriesListingProps } from "./types";

describe("CategoriesListing", () => {
  let defaultProps: CategoriesListingProps;

  beforeEach(() => {
    defaultProps = {
      title: Label.CONFIGS_TITLE,
      categoriesList: CONFIG_CATEGORIES,
      inputMode: FieldName.CONFIG_INPUT_MODE,
      yamlKey: FieldName.CONFIG_YAML,
      changedOnlyLabel: Label.CHANGED_CONFIGS_ONLY,
      docsLabel: Label.MODEL_CONFIG_DOCS,
      docsLink: externalURLs.configureModel,
      tooltipMessage: Label.NO_CHANGED_CONFIGS,
      searchPlaceholder: "Search configurations",
      yamlPlaceholder: Label.MODEL_CONFIG_PLACEHOLDER,
      searchName: "configSearch",
      setYAMLErrors: vi.fn(),
      yamlErrorLabel: Label.INCORRECT_YAML_CONFIGURATION_ERROR,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders properly", () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    expect(
      screen.getByRole("heading", { name: Label.CONFIGS_TITLE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: Label.MODEL_CONFIG_DOCS }),
    ).toHaveAttribute("href", externalURLs.configureModel);
    expect(
      screen.getByRole("radio", { name: InputMode.LIST }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: InputMode.YAML }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: InputMode.LIST })).toBeChecked();
  });

  it("shows list mode content by default", () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    expect(screen.getByRole("radio", { name: InputMode.LIST })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: InputMode.YAML }),
    ).not.toBeChecked();
    expect(
      screen.queryByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).not.toBeInTheDocument();
  });

  it("shows yaml mode content when initialised in yaml mode", () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    expect(screen.getByRole("radio", { name: InputMode.YAML })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: InputMode.LIST }),
    ).not.toBeChecked();
    expect(
      screen.getByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).toBeInTheDocument();
  });

  it("switches to yaml mode and builds yaml from changed values", async () => {
    render(
      <Formik
        initialValues={{
          [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
          "default-space": "my-space",
          "net-bond-reconfigure-delay": 15,
          "disable-network-management": true,
        }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.YAML }));
    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;

    expect(textarea.value).toContain("default-space: my-space");
    expect(textarea.value).toContain("net-bond-reconfigure-delay: 15");
    expect(textarea.value).toContain("disable-network-management: true");
  });

  it("switches back to list mode from yaml mode", async () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));
    expect(
      screen.getByRole("searchbox", {
        name: "Search configurations",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(Label.MODEL_CONFIG_PLACEHOLDER),
    ).not.toBeInTheDocument();
  });

  it("regenerates YAML to include newly changed fields", async () => {
    render(
      <Formik
        initialValues={{
          [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
          "default-space": "my-space",
        }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
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

  it("calls setYAMLErrors and stays in YAML mode when YAML has invalid keys", async () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const textarea = screen.getByPlaceholderText(
      Label.MODEL_CONFIG_PLACEHOLDER,
    ) as HTMLTextAreaElement;
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "unknown-field: value");

    await userEvent.click(screen.getByRole("radio", { name: InputMode.LIST }));

    expect(defaultProps.setYAMLErrors).toHaveBeenCalledOnce();
    expect(screen.getByRole("radio", { name: InputMode.YAML })).toBeChecked();
  });

  it("filters categories by field name", () => {
    vi.useFakeTimers();
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "default-space" },
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByLabelText("default-space")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("container-networking-method"),
    ).not.toBeInTheDocument();
  });

  it("filters categories by description", () => {
    vi.useFakeTimers();
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, {
      target: { value: "network firewalling" },
    });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByLabelText("firewall-mode")).toBeInTheDocument();
    expect(screen.queryByLabelText("default-space")).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    fireEvent.change(searchInput, { target: { value: "Proxy & Mirror" } });
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(
      screen.getByText('No results found for "Proxy & Mirror"'),
    ).toBeInTheDocument();
  });

  it("shows only changed fields when toggled on", async () => {
    render(
      <Formik
        initialValues={{
          [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
          "default-space": "my-space",
        }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const changedOnlySwitch = screen.getByRole("switch", {
      name: Label.CHANGED_CONFIGS_ONLY,
    });
    expect(changedOnlySwitch).not.toBeChecked();
    await userEvent.click(changedOnlySwitch);

    expect(changedOnlySwitch).toBeChecked();
    expect(screen.getByLabelText("default-space")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("container-networking-method"),
    ).not.toBeInTheDocument();
  });

  it("does not toggle and shows a tooltip when there are no changed fields", async () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const changedOnlySwitch = screen.getByRole("switch", {
      name: Label.CHANGED_CONFIGS_ONLY,
    });
    expect(changedOnlySwitch).not.toBeChecked();

    await userEvent.click(changedOnlySwitch);
    expect(changedOnlySwitch).not.toBeChecked();
    expect(screen.getByText(Label.NO_CHANGED_CONFIGS)).toBeInTheDocument();
  });

  it("clears the search and restores the full list", () => {
    vi.useFakeTimers();
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "default-space" } });

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(
      screen.queryByLabelText("container-networking-method"),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /clear search field/i,
      }),
    );
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.getByLabelText("default-space")).toBeInTheDocument();
    expect(
      screen.getByLabelText("container-networking-method"),
    ).toBeInTheDocument();
  });

  it("renders numeric fields correctly", () => {
    render(
      <Formik
        initialValues={{ [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const coresInput = screen.getByLabelText("net-bond-reconfigure-delay");
    expect(coresInput).toHaveAttribute("type", "number");
  });

  it("handles changed numeric fields", async () => {
    render(
      <Formik
        initialValues={{
          [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
          "net-bond-reconfigure-delay": 15,
        }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const changedOnlySwitch = screen.getByRole("switch", {
      name: Label.CHANGED_CONFIGS_ONLY,
    });
    await userEvent.click(changedOnlySwitch);

    expect(changedOnlySwitch).toBeChecked();
    expect(
      screen.getByLabelText("net-bond-reconfigure-delay"),
    ).toBeInTheDocument();
  });

  it("handles changed boolean fields", async () => {
    render(
      <Formik
        initialValues={{
          [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
          "disable-network-management": true,
        }}
        onSubmit={vi.fn()}
      >
        <CategoriesListing {...defaultProps} />
      </Formik>,
    );

    const changedOnlySwitch = screen.getByRole("switch", {
      name: Label.CHANGED_CONFIGS_ONLY,
    });
    await userEvent.click(changedOnlySwitch);

    expect(changedOnlySwitch).toBeChecked();
    expect(
      document.querySelector('select[name="disable-network-management"]'),
    ).toBeInTheDocument();
  });
});
