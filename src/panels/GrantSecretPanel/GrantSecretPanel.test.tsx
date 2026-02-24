import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as secretHooks from "juju/api-hooks/secrets";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  credentialFactory,
} from "testing/factories/general";
import { applicationStatusFactory } from "testing/factories/juju/ClientV8";
import {
  listSecretResultFactory,
  secretAccessInfoFactory,
} from "testing/factories/juju/SecretsV2";
import {
  modelListInfoFactory,
  secretsStateFactory,
  modelSecretsFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import GrantSecretPanel from "./GrantSecretPanel";
import { Label } from "./types";

vi.mock("juju/api-hooks/secrets", () => {
  return {
    useGrantSecret: vi.fn().mockReturnValue(vi.fn()),
    useListSecrets: vi.fn().mockReturnValue(vi.fn()),
    useRevokeSecret: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("GrantSecretPanel", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = `${urls.model.index({
    qualifier: "eggman@external",
    modelName: "test-model",
  })}?panel=grant-secret&secret=secret:aabbccdd`;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        credentials: {
          "wss://example.com/api": credentialFactory.build(),
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: {
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
            uuid: "abc123",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              lxd: applicationStatusFactory.build(),
              etcd: applicationStatusFactory.build(),
              nginx: applicationStatusFactory.build(),
            },
          }),
        },
        secrets: secretsStateFactory.build({
          abc123: modelSecretsFactory.build({
            items: [
              listSecretResultFactory.build({
                uri: "secret:aabbccdd",
              }),
            ],
            loaded: true,
          }),
        }),
      },
    });
    vi.spyOn(secretHooks, "useListSecrets").mockImplementation(() => vi.fn());
  });

  it("displays a spinner while loading", async () => {
    state.juju.secrets = {};
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByRole("alert", { name: "Loading" })).toBeVisible();
  });

  it("displays a message if there are no applications", async () => {
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        applications: {},
      }),
    };
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByText(Label.NO_APPS)).toBeInTheDocument();
  });

  it("displays checkboxes for applications", async () => {
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByRole("checkbox", { name: "etcd" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "lxd" })).toBeInTheDocument();
  });

  it("displays a disabled checkbox for the owner", async () => {
    state.juju.secrets.abc123.items = [
      listSecretResultFactory.build({
        "owner-tag": "application-lxd",
        uri: "secret:aabbccdd",
      }),
    ];
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(
      screen.getByRole("checkbox", { name: "lxd (secret owner)" }),
    ).toBeDisabled();
  });

  it("ticks applications that have already been granted", async () => {
    state.juju.secrets.abc123.items = [
      listSecretResultFactory.build({
        uri: "secret:aabbccdd",
        access: [
          secretAccessInfoFactory.build({ "target-tag": "application-etcd" }),
        ],
      }),
    ];
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByRole("checkbox", { name: "etcd" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "lxd" })).not.toBeChecked();
  });

  it("can grant and revoke apps", async () => {
    state.juju.secrets.abc123.items = [
      listSecretResultFactory.build({
        uri: "secret:aabbccdd",
        access: [
          secretAccessInfoFactory.build({ "target-tag": "application-etcd" }),
        ],
      }),
    ];
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    const revokeSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useRevokeSecret").mockImplementation(
      () => revokeSecret,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "lxd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(grantSecret).toHaveBeenCalledWith("secret:aabbccdd", ["lxd"]);
    expect(revokeSecret).toHaveBeenCalledWith("secret:aabbccdd", ["etcd"]);
  });

  it("does not include owner when granting/revoking", async () => {
    state.juju.secrets.abc123.items = [
      listSecretResultFactory.build({
        uri: "secret:aabbccdd",
        "owner-tag": "application-lxd",
        access: [
          secretAccessInfoFactory.build({ "target-tag": "application-etcd" }),
        ],
      }),
    ];
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    const revokeSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useRevokeSecret").mockImplementation(
      () => revokeSecret,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "nginx" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(grantSecret).toHaveBeenCalledWith("secret:aabbccdd", ["nginx"]);
    expect(revokeSecret).toHaveBeenCalledWith("secret:aabbccdd", ["etcd"]);
  });

  it("displays caught errors", async () => {
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockRejectedValue(new Error("Caught error")));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await waitFor(() => {
      expect(
        document.querySelector(".p-notification--negative"),
      ).toHaveTextContent("Caught error");
    });
  });

  it("displays error string results", async () => {
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockRejectedValue(new Error("String error")));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("String error");
  });

  it("displays error object results", async () => {
    const grantSecret = vi.fn().mockImplementation(
      vi.fn().mockResolvedValue({
        results: [
          { error: { message: "Error result 1" } },
          { error: { message: "Error result 2" } },
        ],
      }),
    );
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Error result 1. Error result 2");
  });

  it("closes the panel if successful", async () => {
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    const { router } = renderComponent(<GrantSecretPanel />, {
      state,
      path,
      url,
    });
    expect(router.state.location.search).toEqual(
      "?panel=grant-secret&secret=secret:aabbccdd",
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(router.state.location.search).toEqual("");
  });

  it("refetch the secrets if successful", async () => {
    const grantSecret = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue({ results: [] }));
    vi.spyOn(secretHooks, "useGrantSecret").mockImplementation(
      () => grantSecret,
    );
    const listSecrets = vi.fn();
    vi.spyOn(secretHooks, "useListSecrets").mockImplementation(
      () => listSecrets,
    );
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(listSecrets).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(listSecrets).toHaveBeenCalled();
  });
});
