import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ConfigData } from "juju/api";
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

import { Label } from "./SecretsPicker/SecretsPicker";
import TextAreaConfig from "./TextAreaConfig";

describe("TextAreaConfig", () => {
  const config: ConfigData = {
    name: "text option",
    default: "word",
    description: "a text option",
    source: "default",
    type: "string",
    value: "word",
    newValue: "word",
  };
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

  it("displays a text input", async () => {
    renderComponent(
      <TextAreaConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />,
      { state, url, path },
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("can change the value", async () => {
    const setNewValue = jest.fn();
    renderComponent(
      <TextAreaConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />,
      { state, url, path },
    );
    await userEvent.type(screen.getByRole("textbox"), "!");
    expect(setNewValue).toHaveBeenCalledWith("text option", "word!");
  });

  it("can set a secret", async () => {
    const setNewValue = jest.fn();
    renderComponent(
      <TextAreaConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />,
      { state, url, path },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CHOOSE_SECRET }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "secret1 (aabbccdd)" }),
    );
    expect(setNewValue).toHaveBeenCalledWith("text option", "secret:aabbccdd");
  });
});
