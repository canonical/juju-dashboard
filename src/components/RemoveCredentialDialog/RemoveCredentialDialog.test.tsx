import { Label as ActionButtonLabel } from "@canonical/react-components/dist/components/ActionButton/ActionButton";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastCardTestId } from "components/ToastCard";
import { actions as jujuActions } from "store/juju";
import { removeCredential } from "store/middleware/process";
import userCredentialsMiddleware from "store/middleware/source/user-credentials";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { findNotificationByText } from "testing/queries/notifications";
import { createStore, renderComponent } from "testing/utils";

import RemoveCredentialDialog from "./RemoveCredentialDialog";
import { Label } from "./types";

describe("RemoveCredentialDialog", () => {
  const TAG = "cloudcred-aws_admin_default";
  const NAME = "default";
  const TITLE = `${Label.TITLE} ${NAME}`;
  const WS_CONTROLLER_URL = "wss://example.com:17070/api";
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: WS_CONTROLLER_URL,
        }),
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
      }),
    });
  });

  it("asks for confirmation before removing", () => {
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        closePortal={vi.fn()}
      />,
      { state },
    );
    const dialog = screen.getByRole("dialog", { name: TITLE });
    expect(dialog).toHaveTextContent(
      `Are you sure you want to remove ${NAME}?`,
    );
    expect(
      within(dialog).getByRole("button", { name: Label.REMOVE }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: Label.CANCEL }),
    ).toBeInTheDocument();
  });

  it("explains that a credential in use can't be removed", async () => {
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={3}
        closePortal={closePortal}
      />,
      { state },
    );
    const dialog = screen.getByRole("dialog", {
      name: `${Label.IN_USE_TITLE} ${NAME}`,
    });
    expect(dialog).toHaveTextContent(
      "3 models currently use this credential. Delete those models before removing it.",
    );
    expect(
      within(dialog).queryByRole("button", { name: Label.REMOVE }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(dialog).getByRole("button", { name: Label.CLOSE }),
    );
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("closes when cancelled", async () => {
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={closePortal}
      />,
      { state },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.CANCEL }));
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("removes the credential", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={closePortal}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    const clearAction = jujuActions.clearRemoveCredential({
      credentialTag: TAG,
      wsControllerURL: WS_CONTROLLER_URL,
    });
    const runAction = removeCredential.run({
      wsControllerURL: WS_CONTROLLER_URL,
      credentialTag: TAG,
    });
    const clearIndex = actions.findIndex(
      (action) => action.type === clearAction.type,
    );
    const runIndex = actions.findIndex(
      (action) => action.type === runAction.type,
    );
    expect(actions[clearIndex]).toMatchObject(clearAction);
    expect(actions[runIndex]).toMatchObject(runAction);
    expect(clearIndex).toBeLessThan(runIndex);

    store.dispatch(
      jujuActions.setRemoveCredentialRunning({
        credentialTag: TAG,
        running: true,
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    expect(
      await within(screen.getByRole("dialog", { name: TITLE })).findByRole(
        "button",
        { name: ActionButtonLabel.WAITING },
      ),
    ).toBeInTheDocument();

    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { result: undefined },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(
      await findNotificationByText(card, `Credential ${NAME} removed`, {
        appearance: "toast",
        severity: "positive",
      }),
    ).toBeInTheDocument();
    expect(closePortal).toHaveBeenCalledTimes(1);
    const invalidateAction = userCredentialsMiddleware.actions.invalidate({
      wsControllerURL: WS_CONTROLLER_URL,
      cloudTags: ["cloud-aws", "cloud-gce"],
    });
    await waitFor(() => {
      expect(
        actions.find((action) => action.type === invalidateAction.type),
      ).toMatchObject(invalidateAction);
    });
  });

  it("shows the error when removing fails, and hides it on retry", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={closePortal}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { error: { message: "boom", source: null } },
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    const dialog = screen.getByRole("dialog", { name: TITLE });
    expect(await within(dialog).findByText("boom")).toBeInTheDocument();
    expect(closePortal).not.toHaveBeenCalled();
    expect(
      actions.find(
        (action) =>
          action.type === userCredentialsMiddleware.actions.invalidate.type,
      ),
    ).toBeUndefined();

    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });

  it("does not start without a controller URL", async () => {
    state.general.config = configFactory.build({ controllerAPIEndpoint: "" });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <RemoveCredentialDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));

    expect(actions).toHaveLength(0);
  });
});
