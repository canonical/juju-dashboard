import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TestId as BulkDestroyTestId } from "components/BulkDestroyModelDialog/types";
import { TestId as DestroyModelTestId } from "components/DestroyModelDialog/types";
import { actions as jujuActions } from "store/juju";
import { DestroyBlockedReason } from "store/juju/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";

import { Label as AccordionLabel } from "./AccordionContent/types";
import DestroyModelsPanel from "./DestroyModelsPanel";
import { Label } from "./types";

describe("DestroyModelsPanel", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            wsControllerURL: "wss://example.com/api",
            canConfigure: true,
          }),
          def456: modelListInfoFactory.build({
            uuid: "def456",
            wsControllerURL: "wss://example.com/api",
            canConfigure: true,
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            applications: {
              easyrsa: applicationStatusFactory.build({
                units: {
                  "easyrsa/0": unitStatusFactory.build(),
                },
              }),
            },
          }),
          def456: modelDataFactory.build({
            uuid: "def456",
            applications: {
              "ceph-mon": applicationStatusFactory.build(),
            },
          }),
        },
        modelsSelectedForDestruction: [
          modelSelectionParamsFactory.build({
            modelUUID: "abc123",
            modelName: "test-model-1",
            skipped: true,
            destroyBlockedReason: DestroyBlockedReason.CONNECTED_OFFERS,
            reviewed: false,
          }),
          modelSelectionParamsFactory.build({
            modelUUID: "def456",
            modelName: "test-model-2",
            skipped: false,
            reviewed: false,
          }),
        ],
      }),
    });
  });

  it("renders properly", () => {
    renderComponent(<DestroyModelsPanel />, { state });
    expect(
      screen.getByRole("heading", { name: "Review 2 models" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    ).toBeInTheDocument();
  });

  it("renders an accordion section for each selected model", () => {
    renderComponent(<DestroyModelsPanel />, { state });
    const headings = screen.getAllByRole("heading");
    expect(within(headings[1]).getByText("test-model-1")).toBeInTheDocument();
    expect(within(headings[2]).getByText("test-model-2")).toBeInTheDocument();
  });

  it("renders a toggle to mark empty models as reviewed when there is at least one such model present", () => {
    state.juju.modelsSelectedForDestruction = [
      ...state.juju.modelsSelectedForDestruction,
      modelSelectionParamsFactory.build(),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    expect(
      screen.getByRole("switch", {
        name: Label.MARK_EMPTY_REVIEWED,
      }),
    ).toBeInTheDocument();
  });

  it("closes the panel and clears the store selection when Cancel is clicked", async () => {
    const { router, store } = renderComponent(<DestroyModelsPanel />, {
      state,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.CANCEL }));
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("panel")).toBeNull();
    expect(store.getState().juju.modelsSelectedForDestruction).toStrictEqual(
      [],
    );
  });

  it("updates footer summary", async () => {
    renderComponent(<DestroyModelsPanel />, { state });
    expect(screen.getByText("0/1 Reviewed, 1 Skipped.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /test-model-2/ }));
    await userEvent.click(
      screen.getByRole("button", { name: AccordionLabel.MARK_REVIEWED }),
    );
    await waitFor(() => {
      expect(screen.getByText("1/1 Reviewed, 1 Skipped.")).toBeInTheDocument();
    });
  });

  it("auto-advances accordion to the next item after marking reviewed", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "test-model-1",
        skipped: false,
        reviewed: false,
      }),
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "test-model-2",
        skipped: false,
        reviewed: false,
      }),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    expect(
      screen.getAllByRole("button", { name: AccordionLabel.MARK_REVIEWED })[0],
    ).toBeVisible();
    await userEvent.click(
      screen.getAllByRole("button", { name: AccordionLabel.MARK_REVIEWED })[0],
    );
    // After reviewing the first model the second tab should now be expanded.
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /test-model-2/ })).toHaveAttribute(
        "aria-expanded",
        "true",
      );
    });
  });

  it("collapses all accordion sections after reviewing the last model", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "test-model-1",
        skipped: false,
        reviewed: false,
      }),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: AccordionLabel.MARK_REVIEWED }),
    );
    await waitFor(() => {
      expect(
        screen.queryByRole("tab", { expanded: true }),
      ).not.toBeInTheDocument();
    });
  });

  it("auto-reviews all empty models when toggle is switched ON", async () => {
    state.juju.modelsSelectedForDestruction = [
      ...state.juju.modelsSelectedForDestruction,
      modelSelectionParamsFactory.build({ modelUUID: "ghi789" }),
      modelSelectionParamsFactory.build({ modelUUID: "jkl012" }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<DestroyModelsPanel />, { state, store });
    await userEvent.click(
      screen.getByRole("switch", {
        name: Label.MARK_EMPTY_REVIEWED,
      }),
    );

    const toggleModelsReviewedForDestructionAction =
      jujuActions.toggleModelsReviewedForDestruction({
        modelUUIDs: ["ghi789", "jkl012"],
        reviewed: true,
        wsControllerURL: "wss://example.com/api",
      });

    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelsReviewedForDestructionAction.type,
        ),
      ).toMatchObject(toggleModelsReviewedForDestructionAction);
    });
  });

  it("un-reviews all auto-reviewed models when toggle is switched OFF", async () => {
    state.juju.modelsSelectedForDestruction = [
      ...state.juju.modelsSelectedForDestruction,
      modelSelectionParamsFactory.build({ modelUUID: "ghi789" }),
      modelSelectionParamsFactory.build({ modelUUID: "jkl012" }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<DestroyModelsPanel />, { state, store });

    const autoReviewToggle = screen.getByRole("switch", {
      name: Label.MARK_EMPTY_REVIEWED,
    });
    await userEvent.click(autoReviewToggle); // Toggle: ON
    await userEvent.click(autoReviewToggle); // Toggle: OFF

    await waitFor(() => {
      const dispatches = actions.filter(
        (dispatch) =>
          dispatch.type === jujuActions.toggleModelsReviewedForDestruction.type,
      );
      expect(dispatches).toHaveLength(2);
      expect(dispatches[0]).toMatchObject({
        payload: { modelUUIDs: ["ghi789", "jkl012"], reviewed: true },
      });
      expect(dispatches[1]).toMatchObject({
        payload: { modelUUIDs: ["ghi789", "jkl012"], reviewed: false },
      });
    });
  });

  it("does not change manually reviewed models when toggled OFF", async () => {
    state.juju.modelsSelectedForDestruction = [
      ...state.juju.modelsSelectedForDestruction,
      modelSelectionParamsFactory.build({
        modelUUID: "ghi789",
        reviewed: true,
      }),
      modelSelectionParamsFactory.build({ modelUUID: "jkl012" }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<DestroyModelsPanel />, { state, store });

    const autoReviewToggle = screen.getByRole("switch", {
      name: Label.MARK_EMPTY_REVIEWED,
    });
    await userEvent.click(autoReviewToggle); // Toggle: ON
    await userEvent.click(autoReviewToggle); // Toggle: OFF

    await waitFor(() => {
      const dispatches = actions.filter(
        (dispatch) =>
          dispatch.type === jujuActions.toggleModelsReviewedForDestruction.type,
      );
      expect(dispatches).toHaveLength(2);
      expect(dispatches[0]).toMatchObject({
        payload: { reviewed: true, modelUUIDs: ["ghi789", "jkl012"] },
      });
      // Only un-review the model that wasn't manually reviewed
      expect(dispatches[1]).toMatchObject({
        payload: { reviewed: false, modelUUIDs: ["jkl012"] },
      });
    });
  });

  it("disables 'Complete review & destroy' when all models are skipped", () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "test-model-1",
        skipped: true,
        reviewed: false,
      }),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    expect(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("opens the single-model destroy dialog when 'Complete review & destroy' is clicked with one destroyable model", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "test-model-2",
        skipped: false,
        reviewed: true,
      }),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    );
    expect(screen.getByTestId(DestroyModelTestId.DIALOG)).toBeInTheDocument();
  });

  it("opens the bulk destroy dialog when 'Complete review & destroy' is clicked with multiple destroyable models", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        modelName: "test-model-1",
        skipped: false,
        reviewed: true,
      }),
      modelSelectionParamsFactory.build({
        modelUUID: "def456",
        modelName: "test-model-2",
        skipped: false,
        reviewed: true,
      }),
    ];
    renderComponent(<DestroyModelsPanel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    );
    expect(screen.getByTestId(BulkDestroyTestId.DIALOG)).toBeInTheDocument();
  });
});
