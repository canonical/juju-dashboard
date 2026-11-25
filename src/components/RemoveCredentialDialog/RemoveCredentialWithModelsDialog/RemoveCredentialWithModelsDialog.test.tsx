import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JIMMRelation } from "juju/jimm/JIMMV4";
import Panels from "panels/Panels";
import { actions as jujuActions } from "store/juju";
import { DestroyBlockedReason } from "store/juju/types";
import type { RootState } from "store/store";
import {
  authUserInfoFactory,
  configFactory,
  generalStateFactory,
} from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import { Label } from "../types";

import RemoveCredentialWithModelsDialog from "./RemoveCredentialWithModelsDialog";

describe("RemoveCredentialWithModelsDialog", () => {
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
      juju: jujuStateFactory.build(),
    });
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        uuid: "abc123",
        model: modelStatusInfoFactory.build({ name: "model1" }),
        info: modelInfoFactory.build({ "cloud-credential-tag": TAG }),
      }),
      def456: modelDataFactory.build({
        uuid: "def456",
        model: modelStatusInfoFactory.build({ name: "model2" }),
        info: modelInfoFactory.build({ "cloud-credential-tag": TAG }),
      }),
    };
    state.juju.models = {
      abc123: modelListInfoFactory.build({
        uuid: "abc123",
        canConfigure: true,
      }),
      def456: modelListInfoFactory.build({
        uuid: "def456",
        canConfigure: true,
      }),
    };
  });

  it("shows the delete steps for a credential in use", async () => {
    state.juju.modelData.def456.info = undefined;
    const store = createStore(state);
    renderComponent(
      <RemoveCredentialWithModelsDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    const dialog = screen.getByRole("dialog", { name: TITLE });
    expect(
      within(dialog).getByRole("button", { name: "Review 2 models" }),
    ).toHaveAttribute("aria-disabled");
    act(() => {
      store.dispatch(
        jujuActions.updateModelInfo({
          modelInfo: {
            results: [
              {
                result: modelInfoFactory.build({
                  uuid: "def456",
                  "cloud-credential-tag": TAG,
                }),
              },
            ],
          },
          wsControllerURL: WS_CONTROLLER_URL,
        }),
      );
    });
    expect(dialog).toHaveTextContent(
      "You cannot remove a credential that is being used by a model. This credential is used by 2 models.",
    );
    expect(dialog).toHaveTextContent(
      "By destroying 2 models you will also be destroying all applications, machines and storage within. Review before continuing",
    );
    expect(
      within(dialog).getByText(Label.REVIEW_MODELS_STEP),
    ).toBeInTheDocument();
    const options = within(dialog).getByRole("radiogroup", {
      name: Label.PICK_OPTION,
    });
    expect(
      within(options).getByRole("radio", {
        name: Label.DELETE_MODELS_AND_CREDENTIAL,
      }),
    ).toBeChecked();
    expect(
      within(options).getByRole("radio", { name: Label.SET_NEW_CREDENTIAL }),
    ).toBeDisabled();
    await waitFor(() => {
      expect(
        within(dialog).getByRole("button", { name: "Review 2 models" }),
      ).not.toHaveAttribute("aria-disabled");
    });
    await userEvent.type(
      within(dialog).getByRole("textbox", {
        name: 'To destroy the models above, enter "destroy 2 models".',
      }),
      "destroy 2 models",
    );
    expect(
      within(dialog).getByRole("button", { name: Label.REMOVE_WITH_MODELS }),
    ).toHaveAttribute("aria-disabled");
  });

  it("opens the review once each model's access has loaded", async () => {
    state.general.controllerConnections = {
      [WS_CONTROLLER_URL]: { user: authUserInfoFactory.build() },
    };
    state.juju.models.abc123.canConfigure = undefined;
    state.juju.models.def456.canConfigure = undefined;
    const [store, actions] = createStore(state, { trackActions: true });
    const { router } = renderComponent(
      <RemoveCredentialWithModelsDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    const reviewButton = screen.getByRole("button", {
      name: "Review 2 models",
    });
    expect(reviewButton).toHaveAttribute("aria-disabled");
    act(() => {
      store.dispatch(
        jujuActions.addCheckRelation({
          tuple: {
            object: "user-eggman@external",
            relation: JIMMRelation.WRITER,
            target_object: "model-abc123",
          },
          allowed: true,
        }),
      );
    });
    act(() => {
      store.dispatch(
        jujuActions.addCheckRelation({
          tuple: {
            object: "user-eggman@external",
            relation: JIMMRelation.WRITER,
            target_object: "model-def456",
          },
          allowed: false,
        }),
      );
    });
    await waitFor(() => {
      expect(reviewButton).not.toHaveAttribute("aria-disabled");
    });
    await userEvent.click(reviewButton);
    expect(
      actions.find(
        (action) => action.type === jujuActions.selectModelsForDestruction.type,
      ),
    ).toMatchObject(
      jujuActions.selectModelsForDestruction({
        models: [
          {
            modelUUID: "abc123",
            modelName: "model1",
            destroyBlockedReason: null,
            skipped: false,
          },
          {
            modelUUID: "def456",
            modelName: "model2",
            destroyBlockedReason: DestroyBlockedReason.NO_ACCESS,
            skipped: true,
          },
        ],
        wsControllerURL: WS_CONTROLLER_URL,
      }),
    );
    expect(router?.state.location.search).toBe(
      `?panel=destroy-models&credentialTag=${TAG}`,
    );
  });

  it("shows the reviewed count and reopens the review without resetting it", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "model1",
        reviewed: true,
      }),
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "model2",
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const { router } = renderComponent(
      <RemoveCredentialWithModelsDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={vi.fn()}
      />,
      { state, store },
    );
    expect(
      screen.getByRole("button", { name: "1/2 Reviewed" }),
    ).not.toHaveClass("p-button--positive");
    act(() => {
      store.dispatch(
        jujuActions.toggleModelReviewedForDestruction({
          modelUUID: "def456",
          wsControllerURL: WS_CONTROLLER_URL,
        }),
      );
    });
    const reviewedButton = await screen.findByRole("button", {
      name: "2/2 Reviewed",
    });
    expect(reviewedButton).toHaveClass("p-button--positive");
    await userEvent.click(reviewedButton);
    expect(
      actions.find(
        (action) => action.type === jujuActions.selectModelsForDestruction.type,
      ),
    ).toBeUndefined();
    expect(router?.state.location.search).toBe(
      `?panel=destroy-models&credentialTag=${TAG}`,
    );
  });

  it("clears its own review selection when closed", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "model1",
      }),
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "model2",
      }),
    ];
    const closePortal = vi.fn();
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <RemoveCredentialWithModelsDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={closePortal}
      />,
      { state, store },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.CANCEL }));
    expect(
      actions.find(
        (action) =>
          action.type === jujuActions.clearSelectedModelsForDestruction.type,
      ),
    ).toBeDefined();
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("closes the review panel first while it is open", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "model1",
      }),
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "model2",
      }),
    ];
    const closePortal = vi.fn();
    const [store, actions] = createStore(state, { trackActions: true });
    const { router } = renderComponent(
      <RemoveCredentialWithModelsDialog
        credentialTag={TAG}
        credentialName={NAME}
        modelCount={2}
        closePortal={closePortal}
      />,
      { state, store, url: `/?panel=destroy-models&credentialTag=${TAG}` },
    );
    await userEvent.keyboard("{Escape}");
    expect(router?.state.location.search).toBe("");
    expect(closePortal).not.toHaveBeenCalled();
    expect(
      actions.find(
        (action) =>
          action.type === jujuActions.clearSelectedModelsForDestruction.type,
      ),
    ).toBeUndefined();
    await userEvent.keyboard("{Escape}");
    expect(closePortal).toHaveBeenCalledTimes(1);
  });

  it("moves focus into the review panel and back", async () => {
    renderComponent(
      <>
        <RemoveCredentialWithModelsDialog
          credentialTag={TAG}
          credentialName={NAME}
          modelCount={2}
          closePortal={vi.fn()}
        />
        <Panels />
      </>,
      { state },
    );
    const reviewButton = screen.getByRole("button", {
      name: "Review 2 models",
    });
    await userEvent.click(reviewButton);
    const panel = await screen.findByRole("dialog", {
      name: "Review 2 models",
    });
    await waitFor(() => {
      expect(panel).toContainElement(document.activeElement as HTMLElement);
    });
    await userEvent.click(
      within(panel).getByRole("button", { name: "Complete review" }),
    );
    await waitFor(() => {
      expect(reviewButton).toHaveFocus();
    });
  });
});
