import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RemoveCredentialDialogLabel } from "components/RemoveCredentialDialog";
import { actions as jujuActions } from "store/juju";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import CredentialActions from "./CredentialActions";
import { Label } from "./types";

describe("CredentialActions", () => {
  const TAG = "cloudcred-aws_admin_default";
  const NAME = "default";

  it("renders properly", async () => {
    renderComponent(
      <CredentialActions credentialTag={TAG} credentialName={NAME} />,
    );
    const toggle = screen.getByRole("button");
    expect(toggle).toHaveAccessibleName(Label.TOGGLE);
    await userEvent.click(toggle);
    expect(
      screen.getByRole("menuitem", { name: Label.REMOVE }),
    ).toBeInTheDocument();
  });

  it("opens the remove credential dialog", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <CredentialActions
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.TOGGLE }));
    await userEvent.click(screen.getByRole("menuitem", { name: Label.REMOVE }));
    const clearAction = jujuActions.clearRemoveCredential({
      credentialTag: TAG,
      wsControllerURL: "wss://example.com:17070/api",
    });
    expect(
      actions.find((action) => action.type === clearAction.type),
    ).toMatchObject(clearAction);
    expect(
      screen.getByRole("dialog", {
        name: `${RemoveCredentialDialogLabel.TITLE} ${NAME}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: Label.REMOVE }),
    ).not.toBeInTheDocument();
  });
});
