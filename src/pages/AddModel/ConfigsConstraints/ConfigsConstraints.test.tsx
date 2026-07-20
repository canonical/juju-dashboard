import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { actions as jujuActions } from "store/juju/slice";
import {
  cloudInfoStateFactory,
  configFieldEntryFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";
import { externalURLs } from "urls";

import { InputMode } from "../types";

import ConfigsConstraints from "./ConfigsConstraints";
import { DisableType, type FormFields, FieldName, Label } from "./types";

describe("ConfigsConstraints", () => {
  let initialValues: FormFields;

  beforeEach(() => {
    initialValues = {
      [FieldName.CONFIG_FIELDS]: [
        configFieldEntryFactory.build({
          label: "default-space",
          arrayIndex: 0,
        }),
        configFieldEntryFactory.build({
          label: "container-networking-method",
          arrayIndex: 1,
        }),
      ],
      [FieldName.CONSTRAINT_FIELDS]: [
        configFieldEntryFactory.build({ label: "cores", arrayIndex: 0 }),
        configFieldEntryFactory.build({ label: "zones", arrayIndex: 1 }),
      ],
      [FieldName.CONFIG_INPUT_MODE]: InputMode.LIST,
      [FieldName.CONSTRAINT_INPUT_MODE]: InputMode.LIST,
      [FieldName.CONFIG_YAML]: "",
      [FieldName.CONSTRAINT_YAML]: "",
      [FieldName.DISABLED_COMMANDS]: DisableType.NONE,
    };
  });

  it("replaces configFields with live entries when store data arrives", async () => {
    const liveEntry = configFieldEntryFactory.build({
      label: "live-field",
      value: "live-value",
      defaultValue: "live-value",
    });
    const state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: { "cloud-aws": { type: "ec2" } },
        }),
      }),
    });
    const { store } = renderComponent(
      <Formik
        initialValues={{ ...initialValues, cloud: "cloud-aws" }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
      { state },
    );
    expect(screen.queryByLabelText("live-field")).not.toBeInTheDocument();

    store.dispatch(
      jujuActions.updateModelConfigDefaults({
        providerType: "ec2",
        update: { data: [liveEntry] },
      }),
    );
    await waitFor(() => {
      expect(screen.getByLabelText("live-field")).toBeInTheDocument();
    });
  });

  it("shows a warning and disables config fields while the model config defaults are loading", async () => {
    const state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        modelConfigDefaults: {
          defaults: {},
          errors: null,
          loading: true,
        },
      }),
    });
    const { store } = renderComponent(
      <Formik initialValues={initialValues} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
      { state },
    );

    const configsSection = screen.getByRole("region", {
      name: Label.CONFIGS_TITLE,
    });
    expect(
      within(configsSection).getByText(/Fetching configurations./),
    ).toBeInTheDocument();
    // All config inputs should be disabled while defaults are loading so the
    // user cannot enter values that will be overwritten on arrival.
    within(configsSection)
      .getAllByRole("textbox")
      .forEach((input) => {
        expect(input).toBeDisabled();
      });

    store.dispatch(
      jujuActions.updateModelConfigDefaults({
        providerType: "ec2",
        update: { loading: false },
      }),
    );
    await waitFor(() => {
      expect(
        within(configsSection).queryByText(/Fetching configurations./),
      ).not.toBeInTheDocument();
    });
  });

  it("renders properly", () => {
    renderComponent(
      <Formik initialValues={initialValues} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    const configsSection = screen.getByRole("region", {
      name: Label.CONFIGS_TITLE,
    });
    expect(
      within(configsSection).getByRole("radio", {
        name: InputMode.LIST,
      }),
    ).toBeChecked();
    expect(
      within(configsSection).getByLabelText(Label.CHANGED_CONFIGS_ONLY),
    ).toBeInTheDocument();

    const constraintsSection = screen.getByRole("region", {
      name: Label.CONSTRAINTS_TITLE,
    });
    expect(
      within(constraintsSection).getByRole("radio", {
        name: InputMode.LIST,
      }),
    ).toBeChecked();
    expect(
      within(constraintsSection).getByLabelText(Label.CHANGED_CONSTRAINTS_ONLY),
    ).toBeInTheDocument();
  });

  it("keeps config and constraint searches independent", async () => {
    vi.useFakeTimers();
    renderComponent(
      <Formik initialValues={initialValues} onSubmit={vi.fn()}>
        <ConfigsConstraints />
      </Formik>,
    );

    const configsSection = screen.getByRole("region", {
      name: Label.CONFIGS_TITLE,
    });
    expect(
      within(configsSection).getByLabelText("default-space"),
    ).toBeInTheDocument();
    expect(
      within(configsSection).getByLabelText("container-networking-method"),
    ).toBeInTheDocument();

    const constraintsSection = screen.getByRole("region", {
      name: Label.CONSTRAINTS_TITLE,
    });
    expect(
      within(constraintsSection).getByLabelText("cores"),
    ).toBeInTheDocument();
    expect(
      within(constraintsSection).getByLabelText("zones"),
    ).toBeInTheDocument();

    const configsSearchInput = within(configsSection).getByRole("searchbox");
    const constraintsSearchInput =
      within(constraintsSection).getByRole("searchbox");

    fireEvent.change(configsSearchInput, {
      target: { value: "default-space" },
    });
    fireEvent.change(constraintsSearchInput, {
      target: { value: "cores" },
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(
      within(configsSection).getByLabelText("default-space"),
    ).toBeInTheDocument();
    expect(
      within(configsSection).queryByLabelText("container-networking-method"),
    ).not.toBeInTheDocument();

    expect(
      within(constraintsSection).getByLabelText("cores"),
    ).toBeInTheDocument();
    expect(
      within(constraintsSection).queryByLabelText("zones"),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders disabled command options with 'none' selected by default", () => {
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          disabledCommands: DisableType.NONE,
        }}
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

  it("allows selecting a different disabled command option", async () => {
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          disabledCommands: DisableType.NONE,
        }}
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

  it("shows the error modal when switching to list mode with invalid YAML", async () => {
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML,
          [FieldName.CONFIG_YAML]: "unknown-field: value",
        }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    const configsSection = screen.getByRole("region", {
      name: Label.CONFIGS_TITLE,
    });
    await userEvent.click(
      within(configsSection).getByRole("radio", { name: InputMode.LIST }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Invalid values will be lost",
    });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText(/invalid configuration values/i),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog).not.toBeInTheDocument();
  });

  it("wipes invalid YAML entries when switching to list mode forcefully", async () => {
    renderComponent(
      <Formik
        initialValues={{
          ...initialValues,
          [FieldName.CONFIG_INPUT_MODE]: InputMode.YAML,
          [FieldName.CONFIG_YAML]:
            "default-space: my-space\nunknown-field: value",
        }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    const configsSection = screen.getByRole("region", {
      name: Label.CONFIGS_TITLE,
    });
    await userEvent.click(
      within(configsSection).getByRole("radio", { name: InputMode.LIST }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Switch to list view" }),
    );

    expect(
      screen.queryByRole("dialog", { name: "Invalid values will be lost" }),
    ).not.toBeInTheDocument();
    expect(
      within(configsSection).getByRole("radio", { name: InputMode.LIST }),
    ).toBeChecked();

    // The valid field value was ported over
    const defaultSpaceInput = within(configsSection).getByLabelText(
      "default-space",
    ) as HTMLInputElement;
    expect(defaultSpaceInput.value).toBe("my-space");
  });
});
