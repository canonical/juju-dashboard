import { screen } from "@testing-library/react";

import { TestId as LoadingTestId } from "components/LoadingSpinner/LoadingSpinner";
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

import SecretsTable, { TestId } from "./SecretsTable";

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
    expect(screen.getByRole("cell", { name: "secret1" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "secret2" })).toBeInTheDocument();
  });

  it("should remove the prefix from the id", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        items: [listSecretResultFactory.build({ uri: "secret:aabbccdd" })],
        loaded: true,
      }),
    });
    renderComponent(<SecretsTable />, { state, path, url });
    expect(screen.getByRole("cell", { name: "aabbccdd" })).toBeInTheDocument();
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
});
