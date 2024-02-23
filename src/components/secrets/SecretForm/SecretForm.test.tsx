import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as secretHooks from "juju/api-hooks/secrets";
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
  modelSecretsContentFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { Label as FieldsLabel } from "./Fields/Fields";
import SecretForm, { TestId } from "./SecretForm";

jest.mock("juju/api-hooks/secrets", () => {
  return {
    useCreateSecrets: jest.fn().mockReturnValue(jest.fn()),
    useUpdateSecrets: jest.fn().mockReturnValue(jest.fn()),
    useListSecrets: jest.fn().mockReturnValue(jest.fn()),
    useGetSecretContent: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe("SecretForm", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    userName: "eggman@external",
    modelName: "test-model",
  });
  const updateURL = `${url}?panel=remove-secret&secret=secret:aabbccdd`;

  beforeEach(() => {
    jest
      .spyOn(secretHooks, "useListSecrets")
      .mockImplementation(() => jest.fn());
    jest
      .spyOn(secretHooks, "useGetSecretContent")
      .mockImplementation(() => jest.fn());

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
                description: "a description",
              }),
            ],
            loaded: true,
            content: modelSecretsContentFactory.build({
              loaded: true,
              content: { key1: btoa("val1"), key2: btoa("val2") },
            }),
          }),
        }),
      },
    });
  });

  it("can create a secret", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ result: "secret:aabbccdd" }] }),
      );
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    const onSuccess = jest.fn();
    renderComponent(
      <SecretForm formId="abc" onSuccess={onSuccess} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.LABEL }),
      "a label",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.DESCRIPTION }),
      "a description",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": "YSB2YWx1ZQ==",
          },
        },
        description: "a description",
        label: "a label",
      },
    ]);
    expect(onSuccess).toHaveBeenCalledWith("secret:aabbccdd");
  });

  it("prefills form when updating secret", async () => {
    renderComponent(
      <SecretForm
        update
        secretURI="secret:aabbccdd"
        formId="abc"
        onSuccess={jest.fn()}
        setSaving={jest.fn()}
      />,
      {
        path,
        state,
        url: updateURL,
      },
    );
    expect(
      screen.getByRole("textbox", { name: FieldsLabel.LABEL }),
    ).toHaveValue("secret1");
    expect(
      screen.getByRole("textbox", { name: FieldsLabel.DESCRIPTION }),
    ).toHaveValue("a description");
    expect(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
    ).toHaveValue("key1");
    expect(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
    ).toHaveValue("val1");
    expect(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 2` }),
    ).toHaveValue("key2");
    expect(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 2` }),
    ).toHaveValue("val2");
  });

  it("can update a secret", async () => {
    const updateSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(secretHooks, "useUpdateSecrets")
      .mockImplementation(() => updateSecrets);
    renderComponent(
      <SecretForm
        update
        secretURI="secret:aabbccdd"
        formId="abc"
        onSuccess={jest.fn()}
        setSaving={jest.fn()}
      />,
      {
        path,
        state,
        url: updateURL,
      },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.LABEL }),
      "mod",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.DESCRIPTION }),
      "mod",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "mod",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "mod",
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.AUTO_PRUNE }),
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    expect(updateSecrets).toHaveBeenCalledWith([
      {
        "auto-prune": true,
        content: {
          data: {
            key1mod: btoa("val1mod"),
            key2: "dmFsMg==",
          },
        },
        description: "a descriptionmod",
        label: "secret1mod",
        uri: "secret:aabbccdd",
      },
    ]);
  });

  it("encodes unencoded values", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": "YSB2YWx1ZQ==",
          },
        },
        description: "",
        label: undefined,
      },
    ]);
  });

  it("does not encode encoded values", async () => {
    const encoded = "YSB2YWx1ZQ==";
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      encoded,
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.IS_BASE_64 }),
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": encoded,
          },
        },
        description: "",
        label: undefined,
      },
    ]);
  });

  it("displays caught errors", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Caught error")));
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    await waitFor(() =>
      expect(
        document.querySelector(".p-notification--negative"),
      ).toHaveTextContent("Caught error"),
    );
  });

  it("displays error string results", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve("String error"));
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    await waitFor(() =>
      expect(
        document.querySelector(".p-notification--negative"),
      ).toHaveTextContent("String error"),
    );
  });

  it("displays error object results", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ error: { message: "Error result" } }] }),
      );
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    await waitFor(() =>
      expect(
        document.querySelector(".p-notification--negative"),
      ).toHaveTextContent("Error result"),
    );
  });

  it("refetches the secrets if successful", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(secretHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    const listSecrets = jest.fn();
    jest
      .spyOn(secretHooks, "useListSecrets")
      .mockImplementation(() => listSecrets);
    renderComponent(
      <SecretForm formId="abc" onSuccess={jest.fn()} setSaving={jest.fn()} />,
      { url: "?panel=add-secret" },
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    expect(listSecrets).not.toHaveBeenCalled();
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.SECRET_FORM)),
    );
    expect(listSecrets).toHaveBeenCalled();
  });
});
