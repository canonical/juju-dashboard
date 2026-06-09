import { screen, waitFor } from "@testing-library/react";
import type { JSX } from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { ToastCardTestId } from "components/ToastCard";
import { actions as jujuActions } from "store/juju";
import modelListSource from "store/middleware/source/model-list";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import { findNotificationByText } from "testing/queries/notifications";
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
    expect(
      await findNotificationByText(card, 'Destroying model "enterprise"...', {
        appearance: "toast",
        severity: "information",
      }),
    ).toBeInTheDocument();
  });

  it("does not show duplicate loading toasts on re-render", async () => {
    state.juju.destroyModel.xyz456 = {
      modelName: "enterprise",
      errors: null,
      loaded: false,
      loading: true,
    };
    renderComponent(<TestComponent />, { state });

    // There should only ever be one loading toast card for this model.
    expect(
      await screen.findAllByTestId(ToastCardTestId.TOAST_CARD),
    ).toHaveLength(1);
  });

  it("shows a negative toast and dispatches clear and invalidate actions on failure", async () => {
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
    const invalidateAction = modelListSource.actions.invalidate({
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(
      await findNotificationByText(
        card,
        'Destroying model "enterprise" failed',
        {
          appearance: "toast",
          severity: "negative",
        },
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
      expect(
        actions.find((dispatch) => dispatch.type === invalidateAction.type),
      ).toMatchObject(invalidateAction);
    });
  });

  it("shows a positive toast and dispatches clear and invalidate actions on success", async () => {
    state.juju.destroyModel.xyz456 = {
      modelName: "enterprise",
      errors: null,
      loaded: true,
      loading: false,
    };
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<TestComponent />, { state, store });

    const clearAction = jujuActions.clearDestroyedModel({
      modelUUID: "xyz456",
      wsControllerURL: "wss://example.com:17070/api",
    });
    const invalidateAction = modelListSource.actions.invalidate({
      wsControllerURL: "wss://example.com:17070/api",
    });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(
      await findNotificationByText(
        card,
        'Model "enterprise" destroyed successfully',
        {
          appearance: "toast",
          severity: "positive",
        },
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
      expect(
        actions.find((dispatch) => dispatch.type === invalidateAction.type),
      ).toMatchObject(invalidateAction);
    });
  });
});
