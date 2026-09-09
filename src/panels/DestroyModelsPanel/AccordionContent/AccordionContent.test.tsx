import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as useCanConfigureModelModule from "hooks/useCanConfigureModel";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  machineStatusFactory,
  remoteApplicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import AccordionContent from "./AccordionContent";
import { Label } from "./types";

describe("AccordionContent", () => {
  let state: RootState;

  beforeEach(() => {
    vi.spyOn(
      useCanConfigureModelModule,
      "useCanConfigureModelWithUUID",
    ).mockReturnValue(true);
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ name: "test-model" }),
            applications: {
              easyrsa: applicationStatusFactory.build({
                units: { "easyrsa/0": unitStatusFactory.build() },
              }),
            },
            machines: { "0": machineStatusFactory.build() },
          }),
        },
      }),
    });
  });

  it("renders info table", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: { "easyrsa/0": unitStatusFactory.build() },
        }),
      },
      machines: { "0": machineStatusFactory.build() },
      offers: {
        db: applicationOfferStatusFactory.build({ "total-connected-count": 0 }),
      },
      "remote-applications": {
        mysql: remoteApplicationStatusFactory.build(),
      },
      storage: [
        {
          "storage-tag": "storage-easyrsa-0",
          kind: 0,
          "owner-tag": "admin",
          persistent: true,
          status: { info: "", since: "", status: "" },
        },
      ],
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(screen.getByText(/Applications \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Machines \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Cross-model relations \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Attached storage \(1\)/)).toBeInTheDocument();
  });

  it("does not render the info table when there is nothing to show", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(screen.getByText("This model is empty.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("marks a model as reviewed", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state, store });

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
  });

  it("does nothing when a reviewed model is reviewed again", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state, store });

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
  });

  it("removes a model from selection", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state, store });

    const toggleModelRemovedFromDestructionAction =
      jujuActions.toggleModelRemovedFromDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(
      screen.getByRole("button", { name: Label.REMOVE_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelRemovedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelRemovedFromDestructionAction);
    });
  });

  it("adds a removed model to selection", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        removed: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state, store });

    const toggleModelRemovedFromDestructionAction =
      jujuActions.toggleModelRemovedFromDestruction({
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
            dispatch.type === toggleModelRemovedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelRemovedFromDestructionAction);
    });
  });

  it("removes a reviewed model from selection", async () => {
    state.juju.modelsSelectedForDestruction = [
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: true,
      }),
    ];
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state, store });

    const toggleModelRemovedFromDestructionAction =
      jujuActions.toggleModelRemovedFromDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });
    const toggleModelReviewedForDestructionAction =
      jujuActions.toggleModelReviewedForDestruction({
        modelUUID: "abc123",
        wsControllerURL: "wss://example.com/api",
      });

    await userEvent.click(
      screen.getByRole("button", { name: Label.REMOVE_MODEL }),
    );
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelRemovedFromDestructionAction.type,
        ),
      ).toMatchObject(toggleModelRemovedFromDestructionAction);
      expect(
        actions.find(
          (dispatch) =>
            dispatch.type === toggleModelReviewedForDestructionAction.type,
        ),
      ).toMatchObject(toggleModelReviewedForDestructionAction);
    });
  });

  it("renders action buttons for a normal model", () => {
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(
      screen.getByRole("button", { name: Label.REMOVE_MODEL }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.MARK_REVIEWED }),
    ).toBeInTheDocument();
  });

  it("hides action buttons when model is a controller model", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ "is-controller": true }),
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(
      screen.queryByRole("button", { name: Label.REMOVE_MODEL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Label.MARK_REVIEWED }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when user does not have access to destroy", () => {
    vi.spyOn(
      useCanConfigureModelModule,
      "useCanConfigureModelWithUUID",
    ).mockReturnValue(false);
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(
      screen.queryByRole("button", { name: Label.REMOVE_MODEL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: Label.MARK_REVIEWED }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when model has connected offers", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
      offers: {
        db: applicationOfferStatusFactory.build({
          "total-connected-count": 1,
        }),
      },
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(
      screen.queryByRole("button", { name: Label.REMOVE_MODEL }),
    ).not.toBeInTheDocument();
  });
});
