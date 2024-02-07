import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TestId as LoadingTestId } from "components/LoadingSpinner/LoadingSpinner";
import * as componentUtils from "components/utils";
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
import { renderComponent } from "testing/utils";
import urls from "urls";

import SecretsTable, { Label, TestId } from "./SecretsTable";

jest.mock("components/utils", () => ({
  ...jest.requireActual("components/utils"),
  copyToClipboard: jest.fn(),
}));

describe("SecretsTable", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    userName: "eggman@external",
    modelName: "test-model",
  });

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
        secrets: secretsStateFactory.build({
          abc123: modelSecretsFactory.build({
            items: [
              listSecretResultFactory.build({ label: "secret1" }),
              listSecretResultFactory.build({ label: "secret2" }),
            ],
            loaded: true,
          }),
        }),
      },
    });
  });

  it("displays the loading state", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        loading: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(screen.queryByTestId(LoadingTestId.LOADING)).toBeInTheDocument();
  });

  it("handles no secrets", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(screen.queryByTestId(TestId.SECRETS_TABLE)).toBeInTheDocument();
  });

  it("should display secrets", async () => {
    renderComponent(<SecretsTable />, { state, path, url });
    expect(
      screen.getByRole("cell", { name: "Show content secret1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: "Show content secret2" }),
    ).toBeInTheDocument();
  });

  it("should remove the prefix from the id", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [listSecretResultFactory.build({ uri: "secret:aabbccdd" })],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(
      screen.getByRole("cell", { name: "aabbccdd Copy" }),
    ).toBeInTheDocument();
  });

  it("can copy the URI", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [listSecretResultFactory.build({ uri: "secret:aabbccdd" })],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.COPY }));
    expect(componentUtils.copyToClipboard).toHaveBeenCalledWith(
      "secret:aabbccdd",
    );
  });

  it("displays 'Model' instead of the UUID", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [listSecretResultFactory.build({ "owner-tag": "model-abc123" })],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(screen.getByRole("cell", { name: "Model" })).toBeInTheDocument();
  });

  it("links to applications", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [
          listSecretResultFactory.build({ "owner-tag": "application-lxd" }),
        ],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(screen.getByRole("link", { name: "lxd" })).toHaveAttribute(
      "href",
      urls.model.app.index({
        userName: "eggman@external",
        modelName: "test-model",
        appName: "lxd",
      }),
    );
  });

  it("can display the remove secret panel", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [listSecretResultFactory.build({ uri: "secret:aabbccdd" })],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(window.location.search).toEqual("");
    await userEvent.click(
      screen.getByRole("button", { name: Label.ACTION_MENU }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.REMOVE_BUTTON }),
    );
    expect(window.location.search).toEqual(
      "?panel=remove-secret&secret=secret%3Aaabbccdd",
    );
  });
});
