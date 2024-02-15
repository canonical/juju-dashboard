import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

import SecretsPicker, { Label } from "./SecretsPicker";

describe("SecretsPicker", () => {
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
              listSecretResultFactory.build({
                label: "secret1",
                uri: "secret:aabbccdd",
              }),
              listSecretResultFactory.build({ uri: "secret:eeffgghh" }),
            ],
            loaded: true,
          }),
        }),
      },
    });
  });

  it("displays a spinner while loading secrets", async () => {
    state.juju.secrets.abc123.loading = true;
    renderComponent(<SecretsPicker setValue={jest.fn()} />, {
      state,
      url,
      path,
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.CHOOSE_SECRET }),
    );
    expect(
      screen.getByRole("alert", { name: Label.LOADING }),
    ).toBeInTheDocument();
  });

  it("displays secret errors", async () => {
    state.juju.secrets.abc123.errors = "Uh oh!";
    renderComponent(<SecretsPicker setValue={jest.fn()} />, {
      state,
      url,
      path,
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.CHOOSE_SECRET }),
    );
    expect(screen.getByText("Uh oh!")).toBeInTheDocument();
  });

  it("lists the secrets", async () => {
    renderComponent(<SecretsPicker setValue={jest.fn()} />, {
      state,
      url,
      path,
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.CHOOSE_SECRET }),
    );
    expect(
      screen.getByRole("button", { name: "secret1 (aabbccdd)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "eeffgghh" }),
    ).toBeInTheDocument();
  });

  it("can set the secret value", async () => {
    const setValue = jest.fn();
    renderComponent(<SecretsPicker setValue={setValue} />, {
      state,
      url,
      path,
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.CHOOSE_SECRET }),
    );
    await userEvent.click(screen.getByRole("button", { name: "eeffgghh" }));
    expect(setValue).toHaveBeenCalledWith("secret:eeffgghh");
  });
});
