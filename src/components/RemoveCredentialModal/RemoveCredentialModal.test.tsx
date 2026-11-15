import { Label as ActionButtonLabel } from "@canonical/react-components/dist/components/ActionButton/ActionButton";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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
import { createStore, renderComponent } from "testing/utils";

import RemoveCredentialModal from "./RemoveCredentialModal";
import { Label } from "./types";

describe("RemoveCredentialModal", () => {
  const TAG = "cloudcred-aws_admin_default";
  const NAME = "default";
  const TITLE = `${Label.TITLE} ${NAME}`;
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
      }),
    });
  });

  it("asks for confirmation when the credential is not in use", () => {
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state },
    );
    const dialog = screen.getByRole("dialog", { name: TITLE });

    expect(dialog).toHaveTextContent(`${Label.CONFIRM_MESSAGE} ${NAME}?`);
    expect(
      within(dialog).getByRole("button", { name: Label.REMOVE }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: Label.CANCEL }),
    ).toBeInTheDocument();
  });

  it("asks for confirmation when the model count is unknown", () => {
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        closePortal={vi.fn()}
      />,
      { state },
    );
    expect(
      within(screen.getByRole("dialog", { name: TITLE })).getByRole("button", {
        name: Label.REMOVE,
      }),
    ).toBeInTheDocument();
  });

  it.each([
    [1, "1 model", Label.IN_USE_SINGULAR],
    [3, "3 models", Label.IN_USE_PLURAL],
  ])(
    "explains how many models use the credential (%i)",
    (modelCount, usedBy, verb) => {
      renderComponent(
        <RemoveCredentialModal
          credentialTag={TAG}
          credentialName={NAME}
          modelCount={modelCount}
          closePortal={vi.fn()}
        />,
        { state },
      );
      const dialog = screen.getByRole("dialog", {
        name: `${Label.IN_USE_TITLE} ${NAME}`,
      });

      expect(dialog).toHaveTextContent(
        `${usedBy} ${verb} ${Label.IN_USE_DETAILS}`,
      );
      expect(within(dialog).getAllByRole("button")).toHaveLength(2);
      expect(
        within(dialog).getByRole("button", { name: Label.CLOSE }),
      ).toBeInTheDocument();
      expect(
        within(dialog).queryByRole("button", { name: Label.REMOVE }),
      ).not.toBeInTheDocument();
    },
  );

  it("closes the in-use modal", async () => {
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={closePortal}
      />,
      { state },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.CLOSE }));
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("cancels the confirmation", async () => {
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
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

  it("starts the remove credential process when confirmed", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));

    const runAction = removeCredential.run({
      wsControllerURL: "wss://example.com:17070/api",
      credentialTag: TAG,
    });
    await waitFor(() => {
      expect(
        actions.find((action) => action.type === runAction.type),
      ).toMatchObject(runAction);
    });
  });

  it("shows the remove button as loading while the process is running", () => {
    state.juju = jujuStateFactory.build({
      removeCredential: {
        [TAG]: { running: true, status: "pending", outcome: null },
      },
    });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state },
    );
    expect(
      within(screen.getByRole("dialog", { name: TITLE })).getByRole("button", {
        name: ActionButtonLabel.WAITING,
      }),
    ).toBeInTheDocument();
  });

  it("shows the error when the process fails", async () => {
    const store = createStore(state);
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
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
        wsControllerURL: "wss://example.com:17070/api",
      }),
    );
    expect(
      await within(screen.getByRole("dialog", { name: TITLE })).findByText(
        "boom",
      ),
    ).toBeInTheDocument();
    expect(closePortal).not.toHaveBeenCalled();
  });

  it("does not show a previous error before confirming", () => {
    state.juju = jujuStateFactory.build({
      removeCredential: {
        [TAG]: {
          running: false,
          status: "pending",
          outcome: { error: { message: "boom", source: null } },
        },
      },
    });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state },
    );
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });

  it("hides a previous error when retrying", async () => {
    state.juju = jujuStateFactory.build({
      removeCredential: {
        [TAG]: {
          running: false,
          status: "pending",
          outcome: { error: { message: "boom", source: null } },
        },
      },
    });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });

  it("closes and shows a toast when the process succeeds", async () => {
    const store = createStore(state);
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
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
        outcome: { result: undefined },
        wsControllerURL: "wss://example.com:17070/api",
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      `${Label.TOAST_PREFIX} ${NAME} ${Label.REMOVED}`,
    );
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("refreshes the credentials list when the process succeeds", async () => {
    state.juju = jujuStateFactory.build({
      cloudInfo: cloudInfoStateFactory.build({
        clouds: {
          "cloud-aws": { type: "ec2" },
          "cloud-gce": { type: "gce" },
        },
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { result: undefined },
        wsControllerURL: "wss://example.com:17070/api",
      }),
    );

    const invalidateAction = userCredentialsMiddleware.actions.invalidate({
      wsControllerURL: "wss://example.com:17070/api",
      cloudTags: ["cloud-aws", "cloud-gce"],
    });
    await waitFor(() => {
      expect(
        actions.find((action) => action.type === invalidateAction.type),
      ).toMatchObject(invalidateAction);
    });
  });

  it("does not refresh the credentials list when the process fails", async () => {
    state.juju = jujuStateFactory.build({
      cloudInfo: cloudInfoStateFactory.build({
        clouds: {
          "cloud-aws": { type: "ec2" },
          "cloud-gce": { type: "gce" },
        },
      }),
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    store.dispatch(
      jujuActions.setRemoveCredentialOutcome({
        credentialTag: TAG,
        outcome: { error: { message: "boom", source: null } },
        wsControllerURL: "wss://example.com:17070/api",
      }),
    );
    expect(await screen.findByText("boom")).toBeInTheDocument();
    expect(
      actions.find(
        (action) =>
          action.type === userCredentialsMiddleware.actions.invalidate.type,
      ),
    ).toBeUndefined();
  });

  it("ignores a previous success before confirming", () => {
    state.juju = jujuStateFactory.build({
      removeCredential: {
        [TAG]: {
          running: false,
          status: "initiated",
          outcome: { result: undefined },
        },
      },
    });
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={closePortal}
      />,
      { state },
    );
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(closePortal).not.toHaveBeenCalled();
  });

  it("does not treat a previous success as a new one when retrying", async () => {
    state.juju = jujuStateFactory.build({
      removeCredential: {
        [TAG]: {
          running: false,
          status: "initiated",
          outcome: { result: undefined },
        },
      },
    });
    const closePortal = vi.fn();
    renderComponent(
      <RemoveCredentialModal
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={0}
        closePortal={closePortal}
      />,
      { state },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.REMOVE }));
    expect(screen.getByRole("dialog", { name: TITLE })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(closePortal).not.toHaveBeenCalled();
  });
});
