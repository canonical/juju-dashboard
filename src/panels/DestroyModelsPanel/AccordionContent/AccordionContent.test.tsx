import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import {
  DestroyBlockedReason,
  type ModelDestructionData,
} from "store/juju/types";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelDestructionDataFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import AccordionContent from "./AccordionContent";
import { Label } from "./types";

describe("AccordionContent", () => {
  let state: RootState;
  let destructionData: ModelDestructionData;

  beforeEach(() => {
    destructionData = modelDestructionDataFactory.build({
      applications: ["easyrsa"],
      machines: ["0"],
      unitCount: 1,
    });
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            canConfigure: true,
          }),
        },
      }),
    });
  });

  it("renders info table", () => {
    destructionData = modelDestructionDataFactory.build({
      hasStorage: true,
      applications: ["easyrsa"],
      machines: ["0"],
      crossModelRelations: [
        { name: "db", endpoints: [], isConnectedOffer: false },
        { name: "mysql", endpoints: [], isConnectedOffer: false },
      ],
      storageIDs: ["easyrsa/0"],
      unitCount: 1,
    });
    renderComponent(
      <AccordionContent modelUUID="abc123" destructionData={destructionData} />,
      { state },
    );
    expect(screen.getByText(/Applications \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Machines \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Cross-model relations \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Attached storage \(1\)/)).toBeInTheDocument();
  });

  it("does not render the info table when there is nothing to show", () => {
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={modelDestructionDataFactory.build()}
      />,
      { state },
    );
    expect(screen.getByText("This model is empty.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("marks a model as reviewed", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const onModelReviewed = vi.fn();
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={destructionData}
        onModelReviewed={onModelReviewed}
      />,
      { state, store },
    );

    const toggleModelReviewedForDestructionAction =
      jujuActions.toggleModelReviewedForDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(
      screen.getByRole("button", { name: Label.MARK_REVIEWED }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelReviewedForDestructionAction.type,
        ),
      ).toMatchObject(toggleModelReviewedForDestructionAction);
    });
    expect(onModelReviewed).toHaveBeenCalledTimes(1);
  });

  it("does nothing when a reviewed model is reviewed again", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    const onModelReviewed = vi.fn();
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={destructionData}
        onModelReviewed={onModelReviewed}
      />,
      { state, store },
    );

    const toggleModelReviewedForDestructionAction =
      jujuActions.toggleModelReviewedForDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(screen.getByRole("button", { name: Label.REVIEWED }));
    await waitFor(() => {
      expect(
        actions.filter(
          (dispatch) =>
            dispatch.type === toggleModelReviewedForDestructionAction.type,
        ),
      ).toHaveLength(0);
    });
    expect(onModelReviewed).not.toHaveBeenCalled();
  });

  it("removes a model from selection and hides reviewed button", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        skipped: false,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <AccordionContent modelUUID="abc123" destructionData={destructionData} />,
      { state, store },
    );

    const toggleModelSkippedFromDestructionAction =
      jujuActions.toggleModelSkippedFromDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    expect(
      screen.getByRole("button", { name: Label.MARK_REVIEWED }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: Label.SKIP_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelSkippedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelSkippedFromDestructionAction);
    });
    expect(
      screen.queryByRole("button", { name: Label.MARK_REVIEWED }),
    ).not.toBeInTheDocument();
  });

  it("adds a skipped model to selection", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        skipped: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <AccordionContent modelUUID="abc123" destructionData={destructionData} />,
      { state, store },
    );

    const toggleModelSkippedFromDestructionAction =
      jujuActions.toggleModelSkippedFromDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelSkippedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelSkippedFromDestructionAction);
    });
  });

  it("preserves the reviewed state when a skipped model is added to selection again", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <AccordionContent modelUUID="abc123" destructionData={destructionData} />,
      { state, store },
    );

    const toggleModelSkippedFromDestructionAction =
      jujuActions.toggleModelSkippedFromDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(
      screen.getByRole("button", { name: Label.SKIP_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelSkippedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelSkippedFromDestructionAction);
    });
    expect(
      screen.queryByRole("button", { name: Label.REVIEWED }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelSkippedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelSkippedFromDestructionAction);
    });

    expect(
      screen.getByRole("button", { name: Label.REVIEWED }),
    ).toBeInTheDocument();
  });

  it("renders action buttons for a normal model", () => {
    renderComponent(
      <AccordionContent modelUUID="abc123" destructionData={destructionData} />,
      { state },
    );
    expect(
      screen.getByRole("button", { name: Label.SKIP_MODEL }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.MARK_REVIEWED }),
    ).toBeInTheDocument();
  });

  it("hides action buttons when model is a controller model", () => {
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.IS_CONTROLLER,
        }}
      />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: Label.SKIP_MODEL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Label.MARK_REVIEWED }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when user does not have access to destroy", () => {
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.NO_ACCESS,
        }}
      />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: Label.SKIP_MODEL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Label.MARK_REVIEWED }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when model has connected offers", () => {
    renderComponent(
      <AccordionContent
        modelUUID="abc123"
        destructionData={{
          ...destructionData,
          destroyBlockedReason: DestroyBlockedReason.CONNECTED_OFFERS,
        }}
      />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: Label.SKIP_MODEL }),
    ).not.toBeInTheDocument();
  });
});
