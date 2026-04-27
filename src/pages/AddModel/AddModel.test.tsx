import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastCardTestId } from "components/ToastCard";
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
import {
  TestId as ConfigsConstraintsTestId,
  Label as ConfigsConstraintsLabel,
  DisableType,
} from "./ConfigsConstraints/types";
import {
  TestId as MandatoryDetailsTestId,
  Label as MandatoryDetailsLabel,
} from "./MandatoryDetails/types";
import { Label, TestId as AddModelTestId, TestId } from "./types";

describe("AddModel page", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
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

  it("starts on the first step by default", () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByTestId(MandatoryDetailsTestId.MANDATORY_DETAILS_FORM),
    ).toBeInTheDocument();
  });

  it("navigates to next step when Next button is clicked", async () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByTestId(MandatoryDetailsTestId.MANDATORY_DETAILS_FORM),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId(ConfigsConstraintsTestId.CONFIGS_CONSTRAINTS_FORM),
    ).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );

    expect(
      screen.queryByTestId(MandatoryDetailsTestId.MANDATORY_DETAILS_FORM),
    ).toBeNull();
    expect(
      screen.getByTestId(ConfigsConstraintsTestId.CONFIGS_CONSTRAINTS_FORM),
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
    expect(
      screen.getByTestId(MandatoryDetailsTestId.MANDATORY_DETAILS_FORM),
    ).toBeInTheDocument();
  });

  it("disables Back button on first step", () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    ).toHaveAttribute("aria-disabled");
  });

  it("enables Back button on subsequent steps", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("disables Next button on last step", async () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).not.toHaveAttribute("aria-disabled");

    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).toHaveAttribute("aria-disabled");
  });

  it("disables Add model button on invalid input", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "-model",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    expect(
      screen.getByRole("button", { name: Label.CREATE_BUTTON }),
    ).toHaveAttribute("aria-disabled");
  });

  it("enables Add model button on valid input", async () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByRole("button", { name: Label.CREATE_BUTTON }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    expect(
      screen.getByRole("button", { name: Label.CREATE_BUTTON }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("navigates to steps when clicking step titles", async () => {
    renderComponent(<AddModel />, { state });
    await userEvent.click(
      screen.getByText("Configuration & Constraints (optional)"),
    );
    expect(
      screen.getByTestId(ConfigsConstraintsTestId.CONFIGS_CONSTRAINTS_FORM),
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

  it("restores mandatory details draft when navigating back", async () => {
    renderComponent(<AddModel />, { state });

    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    );

    expect(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
    ).toHaveValue("my-model");
  });

  it("resets local draft after cancel", async () => {
    const { router } = renderComponent(<AddModel />, { state });
    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );

    expect(router.state.location.pathname).toEqual(urls.models.index);
  });

  it("adds model when valid input is submitted", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AddModel />, { store });

    const addModelAction = jujuActions.addModel({
      cloudTag: "cloud-aws",
      credential: "",
      modelName: "my-model",
      userTag: "user-eggman@external",
      wsControllerURL: "wss://controller.example.com",
      disabledCommands: DisableType.NONE,
    });

    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.ADD_MODEL_FORM)),
    );

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === addModelAction.type),
      ).toMatchObject(addModelAction);
    });
  });

  it("disables commands on selection after successful model creation", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AddModel />, { store });

    const addModelAction = jujuActions.addModel({
      cloudTag: "cloud-aws",
      credential: "",
      modelName: "my-model",
      userTag: "user-eggman@external",
      wsControllerURL: "wss://controller.example.com",
      disabledCommands: DisableType.DESTROY_MODEL,
    });

    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.click(
      screen.getByRole("radio", {
        name: ConfigsConstraintsLabel.DISABLE_DESTROY_MODEL,
      }),
    );
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.ADD_MODEL_FORM)),
    );

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === addModelAction.type),
      ).toMatchObject(addModelAction);
    });
  });

  it("sends changed configs when model is submitted", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<AddModel />, { store });

    const addModelAction = jujuActions.addModel({
      cloudTag: "cloud-aws",
      credential: "",
      config: {
        "default-space": "my-space",
      },
      modelName: "my-model",
      userTag: "user-eggman@external",
      disabledCommands: DisableType.NONE,
      wsControllerURL: "wss://controller.example.com",
    });

    await userEvent.type(
      screen.getByLabelText(new RegExp(MandatoryDetailsLabel.MODEL_NAME)),
      "my-model",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    );
    await userEvent.type(screen.getByLabelText("default-space"), "my-space");
    await waitFor(() =>
      fireEvent.submit(screen.getByTestId(TestId.ADD_MODEL_FORM)),
    );

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === addModelAction.type),
      ).toMatchObject(addModelAction);
    });
  });

  it("shows success toast when model creation succeeds", async () => {
    state.juju.addModelState = {
      loading: false,
      loaded: true,
      success: true,
      errors: null,
    };
    renderComponent(<AddModel />, { state });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(card).toHaveAttribute("data-type", "positive");
    expect(
      await within(card).findByText('Model "" added successfully'),
    ).toBeInTheDocument();
  });

  it("shows error toast when model creation fails", async () => {
    state.juju.addModelState = {
      loading: false,
      loaded: true,
      success: false,
      errors: "Adding model failed",
    };
    renderComponent(<AddModel />, { state });

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(card).toHaveAttribute("data-type", "negative");
    expect(
      await within(card).findByText('Adding model "" failed'),
    ).toBeInTheDocument();
  });

  describe("permission checks", () => {
    it("does not render when user cannot add models (Juju with no clouds)", () => {
      state.juju.cloudInfo = cloudInfoStateFactory.build({
        clouds: {},
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
});
