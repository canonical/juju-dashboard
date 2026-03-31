import { screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PageNotFoundLabel } from "pages/PageNotFound";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  controllerFactory,
  cloudInfoStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";
import urls from "urls";

import AddModel from "./AddModel";
import { Label, TestId as AddModelTestId } from "./types";

describe("AddModel page", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
        controllers: {
          "wss://controller.example.com": [
            controllerFactory.build({
              uuid: "test-controller-1",
            }),
          ],
        },
      }),
    });
  });

  it("renders properly", () => {
    renderComponent(<AddModel />, { state });
    expect(screen.getByTestId(AddModelTestId.COMPONENT)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: Label.TITLE }),
    ).toBeInTheDocument();
  });

  it("navigates to next step when Next button is clicked", async () => {
    renderComponent(<AddModel />, { state });
    expect(screen.getByText("Model name")).toBeInTheDocument();
    expect(
      screen.queryByText("Configuration and constraints form goes here."),
    ).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );

    expect(screen.queryByText("Model name")).toBeNull();
    expect(
      screen.getByText("Configuration and constraints form goes here."),
    ).toBeInTheDocument();
  });

  it("navigates to previous step when Back button is clicked", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    );
    expect(screen.getByText("Model name")).toBeInTheDocument();
  });

  it("does not show Back button on first step", () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.queryByRole("button", { name: Label.BACK_BUTTON }),
    ).not.toBeInTheDocument();
  });

  it("shows Back button on subsequent steps", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    ).toBeInTheDocument();
  });

  it("displays Next button on first two steps", async () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.queryByRole("button", { name: Label.NEXT_BUTTON }),
    ).not.toBeInTheDocument();
  });

  it("disables Create button on final step", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.CREATE_BUTTON }),
    ).toHaveAttribute("disabled");
  });

  it("navigates to steps when clicking step titles", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByText("Configuration & Constraints (optional)"),
    );
    expect(
      screen.getByText("Configuration and constraints form goes here."),
    ).toBeInTheDocument();
  });

  it("navigates back to models page when Cancel is clicked", async () => {
    const { router } = renderComponent(<AddModel />, { state });
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_BUTTON,
    });
    await userEvent.click(cancelButton);
    expect(router.state.location.pathname).toEqual(urls.models.index);
  });

  it("saves mandatory details draft when Next is clicked", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AddModel />, { store });

    await userEvent.type(screen.getByLabelText("Model name"), "my-model");
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );

    const action = jujuActions.saveAddModelForm({
      modelName: "my-model",
      cloud: "cloud-aws",
      region: "",
      credential: "",
      wsControllerURL: "wss://controller.example.com",
    });

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("clears mandatory details draft when Cancel is clicked", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AddModel />, { store });

    await userEvent.type(screen.getByLabelText("Model name"), "my-model");
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );

    const saveAction = jujuActions.saveAddModelForm({
      modelName: "my-model",
      cloud: "cloud-aws",
      region: "",
      credential: "",
      wsControllerURL: "wss://controller.example.com",
    });

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === saveAction.type),
      ).toMatchObject(saveAction);
    });

    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );

    const clearAction = jujuActions.clearAddModelForm({
      wsControllerURL: "wss://controller.example.com",
    });

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
    });
  });

  describe("permission checks", () => {
    it("does not render when user cannot add models (Juju with no clouds)", () => {
      state.juju.cloudInfo = cloudInfoStateFactory.build({
        clouds: {},
        loaded: true,
      });
      renderComponent(<AddModel />, { state });
      expect(
        screen.queryByTestId(AddModelTestId.ADD_MODEL_CONTENT),
      ).not.toBeInTheDocument();
      expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
    });

    it("does not render when user cannot add models (JIMM with no clouds)", () => {
      state.general = generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
        }),
      });
      state.juju.cloudInfo = cloudInfoStateFactory.build({
        clouds: {},
        loaded: true,
      });
      renderComponent(<AddModel />, { state });
      expect(
        screen.queryByTestId(AddModelTestId.ADD_MODEL_CONTENT),
      ).not.toBeInTheDocument();
      expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
    });

    it("does not render when user cannot add models (JIMM with clouds but no controllers)", () => {
      state.general = generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
        }),
      });
      state.juju.controllers = null;
      renderComponent(<AddModel />, { state });
      expect(
        screen.queryByTestId(AddModelTestId.ADD_MODEL_CONTENT),
      ).not.toBeInTheDocument();
      expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
    });

    it("renders when user can add models (Juju with clouds)", () => {
      state.general = generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      });
      state.juju.cloudInfo = cloudInfoStateFactory.build({
        clouds: { "cloud-aws": { type: "ec2" } },
        loaded: true,
      });
      renderComponent(<AddModel />, { state });
      expect(screen.getByTestId(AddModelTestId.COMPONENT)).toBeInTheDocument();
    });

    it("renders when user can add models (JIMM with clouds and controllers)", () => {
      state.general = generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
        }),
      });
      state.juju.cloudInfo = cloudInfoStateFactory.build({
        clouds: { "cloud-aws": { type: "ec2" } },
        loaded: true,
      });
      state.juju.controllers = {
        "wss://controller.example.com": [
          controllerFactory.build({
            uuid: "test-controller-1",
          }),
        ],
      };
      renderComponent(<AddModel />, { state });
      expect(screen.getByTestId(AddModelTestId.COMPONENT)).toBeInTheDocument();
    });
  });

  it("starts on the first step by default", () => {
    renderComponent(<AddModel />, { state });
    expect(screen.getByText("Model name")).toBeInTheDocument();
  });
});
