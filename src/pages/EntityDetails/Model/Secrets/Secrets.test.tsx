import { screen, waitFor } from "@testing-library/react";
import configureStore from "redux-mock-store";

import { TestId as LoadingTestId } from "components/LoadingSpinner/LoadingSpinner";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  modelListInfoFactory,
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Secrets, { TestId } from "./Secrets";

const mockStore = configureStore<RootState, unknown>([]);

describe("Secrets", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url = "/models/eggman@external/test-model/app/easyrsa";

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
            items: [listSecretResultFactory.build()],
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
    renderComponent(<Secrets />, { state, path, url });
    expect(screen.queryByTestId(LoadingTestId.LOADING)).toBeInTheDocument();
  });

  it("displays errors", async () => {
    state.juju.secrets = secretsStateFactory.build({
      abc123: modelSecretsFactory.build({
        errors: "failed to load",
        loaded: true,
      }),
    });
    renderComponent(<Secrets />, { state, path, url });
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("failed to load");
  });

  it("displays a list of secrets", async () => {
    renderComponent(<Secrets />, { state, path, url });
    expect(screen.getByTestId(TestId.SECRETS_TABLE)).toBeInTheDocument();
  });

  it("cleans up secrets when unmounted", async () => {
    const store = mockStore(state);
    const { result } = renderComponent(<Secrets />, { store, path, url });
    result.unmount();
    const updateAction = jujuActions.clearSecrets({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        store
          .getActions()
          .find((dispatch) => dispatch.type === updateAction.type),
      ).toMatchObject(updateAction);
    });
  });

  it("handles no data when unmounting", async () => {
    const store = mockStore(rootStateFactory.build());
    const { result } = renderComponent(<Secrets />, { store, path, url });
    result.unmount();
    const updateAction = jujuActions.clearSecrets({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    await waitFor(() => {
      expect(
        store
          .getActions()
          .find((dispatch) => dispatch.type === updateAction.type),
      ).toBeUndefined();
    });
  });
});
