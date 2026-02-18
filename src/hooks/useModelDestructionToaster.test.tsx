import { screen, waitFor, within } from "@testing-library/react";
import type { JSX } from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { ToastCardTestId } from "components/ToastCard";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";

import useModelDestructionToaster from "./useModelDestructionToaster";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    Link: vi.fn(({ children }) => <a>{children}</a>),
  };
});

const TestComponent = (): JSX.Element => {
  useModelDestructionToaster();
  return <div>Model</div>;
};

describe("useModelDestructionToaster", () => {
  let state: RootState;

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
            qualifier: "user-kirk@external",
          }),
        },
        destroyModel: {
          xyz456: {
            modelName: "enterprise",
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
    state.juju.destroyModel.xyz456 = {
      modelName: "enterprise",
      errors: null,
      loaded: false,
      loading: true,
    };
    renderComponent(<TestComponent />, { state });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(card).toHaveAttribute("data-type", "info");
    expect(
      await within(card).findByText('Destroying model "enterprise"...'),
    ).toBeInTheDocument();
  });

  it("shows a negative toast and dispatches clear action on failure", async () => {
    state.juju.destroyModel.xyz456 = {
      modelName: "enterprise",
      errors: "Permission denied",
      loaded: false,
      loading: false,
    };
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<TestComponent />, { state, store });

    const clearAction = jujuActions.clearDestroyedModel({
      modelUUID: "xyz456",
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
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
    state.juju = jujuStateFactory.build({
      models: {
        xyz456: modelListInfoFactory.build({
          uuid: "xyz456",
          name: "enterprise",
          qualifier: "user-kirk@external",
        }),
      },
      destroyModel: {
        abc123: {
          modelName: "enterprise",
          errors: null,
          loaded: true,
          loading: false,
        },
      },
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<TestComponent />, { state, store });

    const clearAction = jujuActions.clearDestroyedModel({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(card).toHaveAttribute("data-type", "positive");
    expect(
      await within(card).findByText(
        'Model "enterprise" destroyed successfully',
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
    });
  });

  it("takes no action when loaded=true but model is still present", () => {
    state.juju.destroyModel.xyz456 = {
      modelName: "enterprise",
      errors: null,
      loaded: true,
      loading: false,
    };
    renderComponent(<TestComponent />, { state });

    expect(screen.queryByTestId(ToastCardTestId.TOAST_CARD)).toBeNull();
  });
});
