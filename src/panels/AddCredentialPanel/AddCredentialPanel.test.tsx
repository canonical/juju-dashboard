import { act, fireEvent, screen } from "@testing-library/react";
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
              regions: [
                { name: "us-east-1", endpoint: "" },
                { name: "us-west-2", endpoint: "" },
              ],
            },
            "cloud-gce": {
              type: "gce",
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

    const cloudDropdown = screen.getByRole("combobox", {
      name: FieldsLabel.CLOUD,
    });
    const regionDropdown = screen.getByRole("combobox", {
      name: FieldsLabel.REGION,
    });
    const submitButton = screen.getByRole("button", { name: Label.SUBMIT });

    // Check that the region dropdown and submit button are initially disabled
    expect(regionDropdown).toBeDisabled();
    expect(submitButton).toHaveAttribute("aria-disabled", "true");

    // Fill in the required fields
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.NAME }),
      "my-credential",
    );
    await userEvent.selectOptions(cloudDropdown, "cloud-aws");

    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(cloudDropdown));

    // The region field and submit button should now be enabled
    expect(regionDropdown).not.toBeDisabled();
    expect(submitButton).not.toHaveAttribute("aria-disabled", "true");
  });
});
