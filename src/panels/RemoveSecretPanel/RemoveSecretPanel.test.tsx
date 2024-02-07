import { screen } from "@testing-library/react";
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
  secretRevisionFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { Label as FieldsLabel } from "./Fields/Fields";
import RemoveSecretPanel, { Label } from "./RemoveSecretPanel";

jest.mock("juju/apiHooks", () => {
  return {
    useRemoveSecrets: jest.fn().mockReturnValue(jest.fn()),
    useListSecrets: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe("RemoveSecretPanel", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = `${urls.model.index({
    userName: "eggman@external",
    modelName: "test-model",
  })}?panel=remove-secret&secret=secret:aabbccdd`;

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
                uri: "secret:aabbccdd",
                label: "secret1",
                "latest-revision": 2,
                revisions: [
                  secretRevisionFactory.build({ revision: 1 }),
                  secretRevisionFactory.build({ revision: 2 }),
                ],
              }),
            ],
            loaded: true,
          }),
        }),
      },
    });
    jest.spyOn(apiHooks, "useListSecrets").mockImplementation(() => jest.fn());
  });

  it("shows a confirmation when the form is submitted", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      screen.getByRole("dialog", { name: FieldsLabel.CONFIRM_TITLE }),
    ).toBeInTheDocument();
    expect(removeSecrets).not.toHaveBeenCalled();
  });

  it("can remove a secret", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(removeSecrets).toHaveBeenCalledWith([
      {
        uri: "secret:aabbccdd",
        revisions: [2],
      },
    ]);
  });

  it("displays caught errors", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Caught error")));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Caught error");
  });

  it("displays error string results", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve("String error"));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("String error");
  });

  it("displays error object results", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ error: { message: "Error result" } }] }),
      );
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Error result");
  });

  it("closes the panel if successful", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    expect(window.location.search).toEqual(
      "?panel=remove-secret&secret=secret:aabbccdd",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(window.location.search).toEqual("");
  });

  it("refetches the secrets if successful", async () => {
    const removeSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useRemoveSecrets")
      .mockImplementation(() => removeSecrets);
    const listSecrets = jest.fn();
    jest
      .spyOn(apiHooks, "useListSecrets")
      .mockImplementation(() => listSecrets);
    renderComponent(<RemoveSecretPanel />, { state, path, url });
    expect(listSecrets).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    await userEvent.click(
      screen.getByRole("button", { name: FieldsLabel.CONFIRM_BUTTON }),
    );
    expect(listSecrets).toHaveBeenCalled();
  });
});
