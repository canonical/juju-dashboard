import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as apiHooks from "juju/apiHooks";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  credentialFactory,
} from "testing/factories/general";
import {
  modelListInfoFactory,
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
} from "testing/factories/juju/juju";
import { secretAccessInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";
import urls from "urls";

import GrantSecretPanel, { Label } from "./GrantSecretPanel";

jest.mock("juju/apiHooks", () => {
  return {
    useGrantSecret: jest.fn().mockReturnValue(jest.fn()),
    useListSecrets: jest.fn().mockReturnValue(jest.fn()),
    useRevokeSecret: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe("GrantSecretPanel", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = `${urls.model.index({
    userName: "eggman@external",
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
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              lxd: applicationInfoFactory.build(),
              etcd: applicationInfoFactory.build(),
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
    jest.spyOn(apiHooks, "useListSecrets").mockImplementation(() => jest.fn());
  });

  it("displays a spinner while loading", async () => {
    state.juju.secrets = {};
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByRole("alert", { name: "Loading" })).toBeVisible();
  });

  it("displays checkboxes for applications", async () => {
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(screen.getByRole("checkbox", { name: "etcd" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "lxd" })).toBeInTheDocument();
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
    const grantSecret = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
    const revokeSecret = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useRevokeSecret")
      .mockImplementation(() => revokeSecret);
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "lxd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(grantSecret).toHaveBeenCalledWith("secret:aabbccdd", ["lxd"]);
    expect(revokeSecret).toHaveBeenCalledWith("secret:aabbccdd", ["etcd"]);
  });

  it("displays caught errors", async () => {
    const grantSecret = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Caught error")));
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
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
    const grantSecret = jest
      .fn()
      .mockImplementation(() => Promise.resolve("String error"));
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("String error");
  });

  it("displays error object results", async () => {
    const grantSecret = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ error: { message: "Error result" } }] }),
      );
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
    renderComponent(<GrantSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Error result");
  });

  it("closes the panel if successful", async () => {
    const grantSecret = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(window.location.search).toEqual(
      "?panel=grant-secret&secret=secret:aabbccdd",
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(window.location.search).toEqual("");
  });

  it("refetches the secrets if successful", async () => {
    const grantSecret = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useGrantSecret")
      .mockImplementation(() => grantSecret);
    const listSecrets = jest.fn();
    jest
      .spyOn(apiHooks, "useListSecrets")
      .mockImplementation(() => listSecrets);
    renderComponent(<GrantSecretPanel />, { state, path, url });
    expect(listSecrets).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("checkbox", { name: "etcd" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(listSecrets).toHaveBeenCalled();
  });
});
