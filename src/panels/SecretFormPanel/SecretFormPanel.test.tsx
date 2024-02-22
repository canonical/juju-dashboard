import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Label as FieldsLabel } from "components/secrets/SecretForm/Fields/Fields";
import * as apiHooks from "juju/apiHooks";
import { renderComponent } from "testing/utils";

import SecretFormPanel, { Label } from "./SecretFormPanel";

jest.mock("juju/apiHooks", () => {
  return {
    useCreateSecrets: jest.fn().mockReturnValue(jest.fn()),
    useUpdateSecrets: jest.fn().mockReturnValue(jest.fn()),
    useListSecrets: jest.fn().mockImplementation(() => jest.fn()),
    useGetSecretContent: jest.fn().mockReturnValue(jest.fn()),
  };
});

describe("SecretFormPanel", () => {
  beforeEach(() => {
    jest.spyOn(apiHooks, "useListSecrets").mockImplementation(() => jest.fn());
  });

  it("displays correctly when creating a secret", async () => {
    renderComponent(<SecretFormPanel />, { url: "?panel=add-secret" });
    expect(
      screen.getByRole("button", { name: Label.SUBMIT_ADD }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: Label.TITLE_ADD }),
    ).toBeInTheDocument();
  });

  it("displays correctly when updating a secret", async () => {
    renderComponent(<SecretFormPanel update />, {
      url: "?panel=update-secret&secret:aabbccdd",
    });
    expect(
      screen.getByRole("button", { name: Label.SUBMIT_UPDATE }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: Label.TITLE_UPDATE }),
    ).toBeInTheDocument();
  });

  it("closes the panel if successful", async () => {
    const createSecrets = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve({ results: [{ result: "secret:aabbccdd" }] }),
      );
    jest
      .spyOn(apiHooks, "useCreateSecrets")
      .mockImplementation(() => createSecrets);
    renderComponent(<SecretFormPanel />, { url: "?panel=add-secret" });
    expect(window.location.search).toEqual("?panel=add-secret");
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.KEY} 1` }),
      "a key",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: `${FieldsLabel.VALUE} 1` }),
      "a value",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.SUBMIT_ADD }),
    );
    expect(window.location.search).toEqual("");
  });
});
