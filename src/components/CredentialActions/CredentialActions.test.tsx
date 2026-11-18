import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RemoveCredentialDialogLabel } from "components/RemoveCredentialDialog";
import { ToastCardTestId } from "components/ToastCard";
import type { RemoveCredentialEntry } from "store/juju/types";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { jujuStateFactory } from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
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

  it("shows the remove option when opened", async () => {
    renderComponent(
      <CredentialActions credentialTag={TAG} credentialName={NAME} />,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    expect(
      screen.getByRole("menuitem", { name: Label.REMOVE }),
    ).toBeInTheDocument();
  });

  it("opens the remove credential dialog from the remove option", async () => {
    renderComponent(
      <CredentialActions
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    await userEvent.click(screen.getByRole("menuitem", { name: Label.REMOVE }));
    expect(
      screen.getByRole("dialog", {
        name: `${RemoveCredentialDialogLabel.TITLE} ${NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: Label.REMOVE }),
    ).not.toBeInTheDocument();
  });

  it.each<[string, RemoveCredentialEntry["outcome"]]>([
    ["success", { result: undefined }],
    ["error", { error: { message: "boom", source: null } }],
  ])(
    "clears a previous %s when opening the remove credential dialog",
    async (_name, outcome) => {
      const state = rootStateFactory.build({
        general: generalStateFactory.build({
          config: configFactory.build({
            controllerAPIEndpoint: "wss://example.com:17070/api",
          }),
        }),
        juju: jujuStateFactory.build({
          removeCredential: {
            [TAG]: { running: false, status: "initiated", outcome },
          },
        }),
      });
      renderComponent(
        <CredentialActions
          credentialTag={TAG}
          credentialName={NAME}
          modelCount={0}
        />,
        { state },
      );
      await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
      await userEvent.click(
        screen.getByRole("menuitem", { name: Label.REMOVE }),
      );
      const dialog = screen.getByRole("dialog", {
        name: `${RemoveCredentialDialogLabel.TITLE} ${NAME}`,
      });
      expect(dialog).toBeInTheDocument();
      expect(screen.queryByText("boom")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(ToastCardTestId.TOAST_CARD),
      ).not.toBeInTheDocument();
    },
  );
});
