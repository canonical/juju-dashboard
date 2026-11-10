import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import CredentialActions from "./CredentialActions";
import { Label } from "./types";

describe("CredentialActions", () => {
  it("displays the actions menu toggle", () => {
    renderComponent(<CredentialActions />);

    expect(screen.getByRole("button")).toHaveAccessibleName(Label.TOGGLE);
  });

  it("shows the destroy option when opened", async () => {
    renderComponent(<CredentialActions />);

    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));

    expect(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    ).toBeInTheDocument();
  });
});
