import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import AddCredentialPanel from "./AddCredentialPanel";
import { Label as FieldsLabel } from "./Fields/types";
import { Label } from "./types";

describe("AddCredentialPanel", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": {
              type: "ec2",
              "auth-types": ["access-key"],
              regions: [
                { name: "us-east-1", endpoint: "" },
                { name: "us-west-2", endpoint: "" },
              ],
            },
            "cloud-manual": {
              type: "manual",
              "auth-types": ["empty"],
              regions: [],
            },
            "cloud-gce": {
              type: "gce",
              "auth-types": ["oauth2", "jsonfile"],
              regions: [
                { name: "us-central1", endpoint: "" },
                { name: "us-east1", endpoint: "" },
              ],
            },
          },
        }),
      }),
    });
  });

  it("renders the submit button disabled initially", () => {
    renderComponent(<AddCredentialPanel />, {
      state,
      url: "/?panel=add-credential",
    });

    const submitButton = screen.getByRole("button", { name: Label.SUBMIT });
    expect(submitButton).toHaveAttribute("aria-disabled", "true");
  });

  it("disables the region field until a cloud is selected", () => {
    renderComponent(<AddCredentialPanel />, {
      state,
      url: "/?panel=add-credential",
    });

    const regionField = screen.getByRole("combobox", {
      name: FieldsLabel.REGION,
    });
    expect(regionField).toBeDisabled();
  });

  it("enables the submit button when required fields are filled", async () => {
    renderComponent(<AddCredentialPanel />, {
      state,
      url: "/?panel=add-credential",
    });

    const regionDropdown = screen.getByRole("combobox", {
      name: FieldsLabel.REGION,
    });
    const submitButton = screen.getByRole("button", { name: Label.SUBMIT });

    // The region dropdown and submit button are initially disabled
    expect(regionDropdown).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-disabled", "true");

    // Fill in the required fields
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.NAME }),
      "my-credential",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: FieldsLabel.CLOUD }),
      "cloud-aws",
    );

    // Selecting a cloud enables region, but submit stays disabled until the required auth fields
    // are filled.
    expect(regionDropdown).not.toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-disabled", "true");

    // Fill in the newly required auth fields
    const secretKey = screen.getByLabelText(/Secret Key/);
    await userEvent.type(screen.getByLabelText(/Access Key/), "key");
    await userEvent.type(secretKey, "secret");

    // The submit button should now be enabled
    expect(submitButton).not.toHaveAttribute("aria-disabled", "true");
  });

  it("enables auth type dropdown when cloud is selected", async () => {
    renderComponent(<AddCredentialPanel />, {
      state,
      url: "/?panel=add-credential",
    });

    const authTypeDropdown = screen.getByRole("combobox", {
      name: FieldsLabel.AUTH_TYPE,
    });

    // Auth type should be disabled initially
    expect(authTypeDropdown).toBeDisabled();

    // Select a cloud
    await userEvent.selectOptions(
      screen.getByRole("combobox", {
        name: FieldsLabel.CLOUD,
      }),
      "cloud-aws",
    );

    // Auth type dropdown should now be enabled
    await waitFor(() => {
      expect(authTypeDropdown).not.toBeDisabled();
    });
  });

  it("enables the submit button for a cloud that only needs a credential name", async () => {
    renderComponent(<AddCredentialPanel />, {
      state,
      url: "/?panel=add-credential",
    });

    const nameField = screen.getByRole("textbox", { name: FieldsLabel.NAME });
    await userEvent.type(nameField, "my-credential");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: FieldsLabel.CLOUD }),
      "cloud-manual",
    );

    expect(
      screen.getByRole("button", { name: Label.SUBMIT }),
    ).not.toHaveAttribute("aria-disabled", "true");
  });
});
