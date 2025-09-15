import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { FieldsLabel } from "components/secrets/SecretForm/Fields";
import * as secretHooks from "juju/api-hooks/secrets";
import { renderComponent } from "testing/utils";

import SecretFormPanel from "./SecretFormPanel";
import { Label } from "./types";

vi.mock("juju/api-hooks/secrets", () => {
  return {
    useCreateSecrets: vi.fn().mockReturnValue(vi.fn()),
    useUpdateSecrets: vi.fn().mockReturnValue(vi.fn()),
    useListSecrets: vi.fn().mockImplementation(() => vi.fn()),
    useGetSecretContent: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("SecretFormPanel", () => {
  beforeEach(() => {
    vi.spyOn(secretHooks, "useListSecrets").mockImplementation(() => vi.fn());
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
    const createSecrets = vi
      .fn()
      .mockImplementation(
        vi.fn().mockResolvedValue({ results: [{ result: "secret:aabbccdd" }] }),
      );
    vi.spyOn(secretHooks, "useCreateSecrets").mockImplementation(
      () => createSecrets,
    );
    const { router } = renderComponent(<SecretFormPanel />, {
      url: "?panel=add-secret",
    });
    expect(router.state.location.search).toEqual("?panel=add-secret");
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
    expect(router.state.location.search).toEqual("");
  });
});
