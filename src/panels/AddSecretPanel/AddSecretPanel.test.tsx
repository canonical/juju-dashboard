import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as apiHooks from "juju/apiHooks";
import { renderComponent } from "testing/utils";

import AddSecretPanel, { Label } from "./AddSecretPanel";
import { Label as FieldsLabel } from "./Fields/Fields";
import { RotatePolicy } from "./types";

jest.mock("juju/apiHooks", () => {
  return {
    useCreateSecrets: jest.fn().mockReturnValue(jest.fn()),
    useListSecrets: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe("AddSecretPanel", () => {
  beforeEach(() => {
    jest.spyOn(apiHooks, "useListSecrets").mockImplementation(() => jest.fn());
  });

  it("can create a secret", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.LABEL }),
      "a label",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.DESCRIPTION }),
      "a description",
    );
    const expiryField = document.querySelector('input[name="expiryTime"]');
    expect(expiryField).toBeInTheDocument();
    const expiry = "2024-02-17T13:14";
    if (expiryField) {
      await userEvent.type(expiryField, expiry);
    }
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: FieldsLabel.ROTATE_POLICY }),
      RotatePolicy.MONTHLY,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": "YSB2YWx1ZQ==",
          },
        },
        description: "a description",
        "expire-time": new Date(expiry).toISOString(),
        label: "a label",
        "rotate-policy": "monthly",
      },
    ]);
  });

  it("encodes unencoded values", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": "YSB2YWx1ZQ==",
          },
        },
        description: "",
        "expire-time": undefined,
        label: undefined,
        "rotate-policy": "never",
      },
    ]);
  });

  it("does not encode encoded values", async () => {
    const encoded = "YSB2YWx1ZQ==";
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
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
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(createSecrets).toHaveBeenCalledWith([
      {
        content: {
          data: {
            "a key": encoded,
          },
        },
        description: "",
        "expire-time": undefined,
        label: undefined,
        "rotate-policy": "never",
      },
    ]);
  });

  it("displays caught errors", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.reject(new Error("Caught error")));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Caught error");
  });

  it("displays error string results", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve("String error"));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("String error");
  });

  it("displays error object results", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ error: { message: "Error result" } }] }),
      );
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />);
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(
      document.querySelector(".p-notification--negative"),
    ).toHaveTextContent("Error result");
  });

  it("closes the panel if successful", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<AddSecretPanel />, { url: "?panel=add-secret" });
    expect(window.location.search).toEqual("?panel=add-secret");
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(window.location.search).toEqual("");
  });

  it("refetches the secrets if successful", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ results: [] }));
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    const listSecrets = jest.fn();
    jest
      .spyOn(apiHooks, "useListSecrets")
      .mockImplementation(() => listSecrets);
    renderComponent(<AddSecretPanel />, { url: "?panel=add-secret" });
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    expect(listSecrets).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(listSecrets).toHaveBeenCalled();
  });
});
