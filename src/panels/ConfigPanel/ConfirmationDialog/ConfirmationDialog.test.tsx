import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";
import { vi } from "vitest";

import * as useCanManageSecrets from "hooks/useCanManageSecrets";
import * as applicationHooks from "juju/api-hooks/application";
import * as secretHooks from "juju/api-hooks/secrets";
import { ConfirmType as DefaultConfirmType } from "panels/types";
import type { RootState } from "store/store";
import { configFactory } from "testing/factories/juju/Application";
import {
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import type { Config } from "../types";
import { ConfigConfirmType } from "../types";

import ConfirmationDialog from "./ConfirmationDialog";
import { InlineErrors, Label, Label as ConfirmationDialogLabel } from "./types";

describe("ConfirmationDialog", () => {
  let state: RootState;
  const params = new URLSearchParams({
    entity: "easyrsa",
    charm: "cs:easyrsa",
    modelUUID: "abc123",
    panel: "config",
  });
  const url = `/models/eggman@external/hadoopspark?${params.toString()}`;
  let mockSetConfirmType: Mock;
  let mockSetInlineError: Mock;
  let mockHandleRemovePanelQueryParams: Mock;

  const mockConfig = {
    email: {
      default: "",
      description:
        "Base64 encoded Certificate Authority (CA) bundle. Setting this config\n" +
        "allows container runtimes to pull images from registries with TLS\n" +
        "certificates signed by an external CA.\n",
      source: "default",
      type: "string",
      value: "",
      name: "email",
      newValue: "secret:aabbccdd",
      error: null,
    },
    name: {
      default: "eggman",
      description:
        "Base64 encoded Certificate Authority (CA) bundle. Setting this config\n" +
        "allows container runtimes to pull images from registries with TLS\n" +
        "certificates signed by an external CA.\n",
      source: "default",
      type: "string",
      value: "",
      name: "name",
    },
  } as Config;
  const mockQueryParams = {
    panel: "config",
    charm: "cs:easyrsa",
    entity: "easyrsa",
    modelUUID: "abc123",
  };

  beforeEach(() => {
    mockSetConfirmType = vi.fn();
    mockSetInlineError = vi.fn();
    mockHandleRemovePanelQueryParams = vi.fn();
    vi.resetModules();
    state = rootStateFactory.build();
    const setApplicationConfig = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    vi.spyOn(applicationHooks, "useSetApplicationConfig").mockImplementation(
      () => setApplicationConfig,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should display submit confirmation dialog and can cancel submit", async () => {
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.SUBMIT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    expect(
      screen.getByRole("dialog", { name: Label.SAVE_CONFIRM }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.SAVE_CONFIRM_CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    ).toBeInTheDocument();
    // Check that the application name is displayed in the confirmation message.
    expect(
      screen.getByText(
        "You have edited the following values to the easyrsa configuration:",
      ),
    ).toBeInTheDocument();
    // Check that the changed values are displayed.
    expect(
      screen.getByText("email") && screen.getByText("secret:aabbccdd"),
    ).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
  });

  it("should submit successfully and remove panel query params", async () => {
    const setApplicationConfig = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    vi.spyOn(applicationHooks, "useSetApplicationConfig").mockImplementation(
      () => setApplicationConfig,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.SUBMIT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={mockHandleRemovePanelQueryParams}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(setApplicationConfig).toHaveBeenCalledWith("easyrsa", {
      email: configFactory.build({
        error: null,
        name: "email",
        default: "",
        newValue: "secret:aabbccdd",
      }),
      name: configFactory.build({
        name: "name",
        default: "eggman",
      }),
    });
    expect(mockHandleRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should submit successfully and open up grant confirmation dialog", async () => {
    const setApplicationConfig = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    vi.spyOn(applicationHooks, "useSetApplicationConfig").mockImplementation(
      () => setApplicationConfig,
    );
    vi.spyOn(useCanManageSecrets, "default").mockImplementation(() => true);
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [
          listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
        ],
        loaded: true,
      }),
    });
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.SUBMIT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(setApplicationConfig).toHaveBeenCalledWith("easyrsa", {
      email: configFactory.build({
        error: null,
        name: "email",
        default: "",
        newValue: "secret:aabbccdd",
      }),
      name: configFactory.build({
        name: "name",
        default: "eggman",
      }),
    });
    expect(mockSetConfirmType).toHaveBeenCalledWith(ConfigConfirmType.GRANT);
  });

  it("should console error when trying to submit", async () => {
    const setApplicationConfig = vi
      .fn()
      .mockImplementation(() =>
        Promise.reject(new Error("Error while trying to save")),
      );
    vi.spyOn(applicationHooks, "useSetApplicationConfig").mockImplementation(
      () => setApplicationConfig,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.SUBMIT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={mockSetInlineError}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SAVE_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(mockSetInlineError).toHaveBeenCalledWith(InlineErrors.FORM, null);
    expect(setApplicationConfig).toHaveBeenCalledWith("easyrsa", {
      email: configFactory.build({
        error: null,
        name: "email",
        default: "",
        newValue: "secret:aabbccdd",
      }),
      name: configFactory.build({
        name: "name",
        default: "eggman",
      }),
    });
    expect(mockSetInlineError).toHaveBeenCalledWith(
      InlineErrors.SUBMIT_TO_JUJU,
      Label.SUBMIT_TO_JUJU_ERROR,
    );
  });

  it("should display grant confirmation dialog and can cancel grant", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [
          listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
        ],
        loaded: true,
      }),
    });
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfigConfirmType.GRANT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={mockHandleRemovePanelQueryParams}
      />,
      {
        url,
        state,
      },
    );

    expect(
      screen.getByRole("dialog", {
        name: Label.GRANT_CONFIRM,
      }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.GRANT_CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.GRANT_CONFIRM_BUTTON }),
    ).toBeInTheDocument();
    expect(screen);
    expect(
      screen.getByText(
        "Would you like to grant access to this application for the following secrets?",
      ),
    ).toBeInTheDocument();
    // Check that the secret is displayed.
    expect(screen.getByText("aabbccdd")).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(mockHandleRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should grant secret successfully and remove panel query params", async () => {
    const grantSecret = vi.fn().mockImplementation(() => Promise.resolve());
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [
          listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
        ],
        loaded: true,
      }),
    });
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfigConfirmType.GRANT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={mockSetInlineError}
        config={mockConfig}
        handleRemovePanelQueryParams={mockHandleRemovePanelQueryParams}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: ConfirmationDialogLabel.GRANT_CONFIRM_BUTTON,
      }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(mockSetInlineError).toHaveBeenCalledWith(InlineErrors.FORM, null);
    expect(grantSecret).toHaveBeenCalledWith("secret:aabbccdd", ["easyrsa"]);
    expect(mockHandleRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should console error when trying to grant access", async () => {
    const grantSecret = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Caught error")));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [
          listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
        ],
        loaded: true,
      }),
    });
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfigConfirmType.GRANT}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={mockSetInlineError}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: ConfirmationDialogLabel.GRANT_CONFIRM_BUTTON,
      }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(mockSetInlineError).toHaveBeenCalledWith(InlineErrors.FORM, null);
    expect(grantSecret).toHaveBeenCalledWith("secret:aabbccdd", ["easyrsa"]);
    expect(mockSetInlineError).toHaveBeenCalledWith(
      InlineErrors.SUBMIT_TO_JUJU,
      Label.GRANT_ERROR,
    );
  });

  it("should display cancel confirmation dialog and can cancel the cancelation", async () => {
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.CANCEL}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={mockHandleRemovePanelQueryParams}
      />,
      {
        url,
        state,
      },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    expect(mockHandleRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should cancel successfully", async () => {
    renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.CANCEL}
        queryParams={mockQueryParams}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={mockSetConfirmType}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    expect(
      screen.getByRole("dialog", { name: Label.CANCEL_CONFIRM }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_CONFIRM_CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.CANCEL_CONFIRM_CONFIRM_BUTTON }),
    ).toBeInTheDocument();
    // Check that the application name is displayed in the confirmation message.
    expect(
      screen.getByText(
        "You have edited the following values to the easyrsa configuration:",
      ),
    ).toBeInTheDocument();
    // Check that the changed values are displayed.
    expect(
      screen.getByText("email") && screen.getByText("secret:aabbccdd"),
    ).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
  });

  it("should display nothing if no application name is provided", () => {
    const {
      result: { container },
    } = renderComponent(
      <ConfirmationDialog
        confirmType={DefaultConfirmType.CANCEL}
        queryParams={{ ...mockQueryParams, entity: "" }}
        setEnableSave={vi.fn()}
        setSavingConfig={vi.fn()}
        setConfirmType={vi.fn()}
        setInlineError={vi.fn()}
        config={mockConfig}
        handleRemovePanelQueryParams={vi.fn()}
      />,
      {
        url,
        state,
      },
    );
    expect(container.tagName).toBe("DIV");
    expect(container.children.length).toBe(1);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
