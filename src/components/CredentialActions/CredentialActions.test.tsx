import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RemoveCredentialModalLabel } from "components/RemoveCredentialModal";
import { renderComponent } from "testing/utils";

import CredentialActions from "./CredentialActions";
import { Label } from "./types";

describe("CredentialActions", () => {
  const TAG = "cloudcred-aws_admin_default";
  const NAME = "default";

  it("displays the actions menu toggle", () => {
    renderComponent(
      <CredentialActions credentialTag={TAG} credentialName={NAME} />,
    );
    expect(screen.getByRole("button")).toHaveAccessibleName(Label.TOGGLE);
  });

  it("shows the destroy option when opened", async () => {
    renderComponent(
      <CredentialActions credentialTag={TAG} credentialName={NAME} />,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    ).toBeInTheDocument();
  });

  it("opens the remove credential modal from the destroy option", async () => {
    renderComponent(
      <CredentialActions
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    await userEvent.click(
      screen.getByRole("menuitem", { name: Label.DESTROY }),
    );
    expect(
      screen.getByRole("dialog", {
        name: `${RemoveCredentialModalLabel.TITLE} ${NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: Label.DESTROY }),
    ).not.toBeInTheDocument();
  });
});
