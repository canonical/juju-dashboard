import { screen, waitFor, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";

import ModelDestructionToaster from "./ModelDestructionToaster";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Link: vi.fn(({ children }) => <a>{children}</a>),
  };
});

describe("ModelDestructionToaster", () => {
  let state: RootState;
  const baseStatus = {
    loading: false,
    loaded: false,
    errors: null,
  };

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
      }),
      juju: jujuStateFactory.build({
        models: {
          xyz456: modelListInfoFactory.build({
            uuid: "xyz456",
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        destroyModel: {
          xyz456: {
            errors: null,
            loaded: false,
            loading: false,
          },
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows an info toast when destruction is loading", async () => {
    const destructionStatus = { ...baseStatus, loading: true };
    renderComponent(
      <ModelDestructionToaster
        modelUUID="xyz456"
        destructionStatus={destructionStatus}
      />,
      { state },
    );

    const card = await screen.findByTestId("toast-card");
    expect(card).toHaveAttribute("data-type", "info");
    expect(
      await within(card).findByText('Destroying model "enterprise"...'),
    ).toBeInTheDocument();
  });

  it("shows a negative toast and dispatches clear action on failure", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const destructionStatus = {
      ...baseStatus,
      errors: "Permission denied",
    };
    renderComponent(
      <ModelDestructionToaster
        modelUUID="xyz456"
        destructionStatus={destructionStatus}
      />,
      { state, store },
    );

    const clearAction = jujuActions.clearDestroyedModel({
      modelUUID: "xyz456",
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId("toast-card");
    expect(card).toHaveAttribute("data-type", "negative");
    expect(
      await within(card).findByText('Destroying model "enterprise" failed'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
    });
  });

  it("shows a positive toast and dispatches clear action on success", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const destructionStatus = {
      ...baseStatus,
      loaded: true,
    };
    renderComponent(
      <ModelDestructionToaster
        modelUUID="abc123"
        destructionStatus={destructionStatus}
      />,
      { state, store },
    );

    const clearAction = jujuActions.clearDestroyedModel({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId("toast-card");
    expect(card).toHaveAttribute("data-type", "positive");
    expect(
      await within(card).findByText('Model "" destroyed successfully'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
    });
  });

  it("takes no action when loaded=true but model is still present", () => {
    const destructionStatus = {
      ...baseStatus,
      loaded: true,
    };
    renderComponent(
      <ModelDestructionToaster
        modelUUID="xyz456"
        destructionStatus={destructionStatus}
      />,
      { state },
    );

    expect(screen.queryByTestId("toast-card")).toBeNull();
  });
});
