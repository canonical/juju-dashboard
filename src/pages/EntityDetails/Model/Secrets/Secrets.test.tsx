import { screen } from "@testing-library/react";

import { TestId as LoadingTestId } from "components/LoadingSpinner/LoadingSpinner";
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
    const { result } = renderComponent(<Secrets />, { state, path, url });
    expect(screen.getByTestId(TestId.SECRETS_TABLE)).toBeInTheDocument();
    result.unmount();
    expect(screen.queryByTestId(TestId.SECRETS_TABLE)).not.toBeInTheDocument();
  });
});
