import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PageNotFoundLabel } from "pages/PageNotFound";
import type { RootState } from "store/store";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  controllerFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";
import urls from "urls";

import AddModel from "./AddModel";
import { Label, StepType, TestId as AddModelTestId } from "./types";

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
        cloudInfo: {
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
          errors: null,
          loaded: true,
          loading: false,
        },
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
    expect(screen.getByText(Label.TITLE)).toBeInTheDocument();
  });

  it("displays the correct step when URL has step parameter", () => {
    renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.ACCESS_MANAGEMENT}`,
    });
    expect(
      screen.getByText("Access management form goes here."),
    ).toBeInTheDocument();
  });

  it("navigates to next step when Next button is clicked", async () => {
    const { router } = renderComponent(<AddModel />, { state });
    expect(
      screen.getByText("Mandatory details form goes here."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Configuration and constraints form goes here."),
    ).toBeNull();

    const nextButton = screen.getByRole("button", { name: Label.NEXT_BUTTON });
    await userEvent.click(nextButton);

    expect(screen.queryByText("Mandatory details form goes here.")).toBeNull();
    expect(
      screen.getByText("Configuration and constraints form goes here."),
    ).toBeInTheDocument();
    expect(router.state.location.search).toContain(
      `step=${StepType.CONFIGURATION_CONSTRAINTS}`,
    );
  });

  it("navigates to previous step when Back button is clicked", async () => {
    const { router } = renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.CONFIGURATION_CONSTRAINTS}`,
    });
    const backButton = screen.getByRole("button", { name: Label.BACK_BUTTON });
    await userEvent.click(backButton);
    expect(
      screen.getByText("Mandatory details form goes here."),
    ).toBeInTheDocument();
    expect(router.state.location.search).toContain(
      `step=${StepType.MANDATORY_DETAILS}`,
    );
  });

  it("does not show Back button on first step", () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.queryByRole("button", { name: Label.BACK_BUTTON }),
    ).not.toBeInTheDocument();
  });

  it("shows Back button on subsequent steps", () => {
    renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.CONFIGURATION_CONSTRAINTS}`,
    });
    expect(
      screen.getByRole("button", { name: Label.BACK_BUTTON }),
    ).toBeInTheDocument();
  });

  it("displays Next button on first two steps", () => {
    renderComponent(<AddModel />, { state });
    expect(
      screen.getByRole("button", { name: Label.NEXT_BUTTON }),
    ).toBeInTheDocument();

    renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.CONFIGURATION_CONSTRAINTS}`,
    });
    expect(
      screen.getAllByRole("button", { name: Label.NEXT_BUTTON }),
    ).toHaveLength(2);

    renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.ACCESS_MANAGEMENT}`,
    });
    expect(
      screen.getAllByRole("button", { name: Label.NEXT_BUTTON }),
    ).toHaveLength(2);
  });

  it("disables Create button on final step", () => {
    renderComponent(<AddModel />, {
      state,
      url: `?step=${StepType.ACCESS_MANAGEMENT}`,
    });
    const createButton = screen.getByRole("button", {
      name: Label.CREATE_BUTTON,
    });
    expect(createButton).toHaveAttribute("disabled");
  });

  it("navigates to steps when clicking step titles", async () => {
    const { router } = renderComponent(<AddModel />, { state });
    const configStep = screen.getByText(
      "Configuration & Constraints (optional)",
    );
    await userEvent.click(configStep);
    expect(
      screen.getByText("Configuration and constraints form goes here."),
    ).toBeInTheDocument();
    expect(router.state.location.search).toContain(
      `step=${StepType.CONFIGURATION_CONSTRAINTS}`,
    );
  });

  it("navigates back to models page when Cancel is clicked", async () => {
    const { router } = renderComponent(<AddModel />, { state });
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_BUTTON,
    });
    await userEvent.click(cancelButton);
    expect(router.state.location.pathname).toEqual(urls.models.index);
  });

  describe("permission checks", () => {
    it("does not render when user cannot add models (Juju with no clouds)", () => {
      state.juju.cloudInfo = {
        clouds: {},
        errors: null,
        loaded: true,
        loading: false,
      };
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
      state.juju.cloudInfo = {
        clouds: {},
        errors: null,
        loaded: true,
        loading: false,
      };
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
      state.juju.cloudInfo = {
        clouds: { "cloud-aws": { type: "ec2" } },
        errors: null,
        loaded: true,
        loading: false,
      };
      renderComponent(<AddModel />, { state });
      expect(screen.getByTestId(AddModelTestId.COMPONENT)).toBeInTheDocument();
    });

    it("renders when user can add models (JIMM with clouds and controllers)", () => {
      state.general = generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
        }),
      });
      state.juju.cloudInfo = {
        clouds: { "cloud-aws": { type: "ec2" } },
        errors: null,
        loaded: true,
        loading: false,
      };
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

  describe("invalid step parameter handling", () => {
    it("defaults to first step when invalid step is in URL", () => {
      renderComponent(<AddModel />, {
        state,
        url: "?step=invalid-step",
      });
      expect(
        screen.getByText("Mandatory details form goes here."),
      ).toBeInTheDocument();
    });

    it("defaults to first step when step parameter is missing", () => {
      renderComponent(<AddModel />, { state });
      expect(
        screen.getByText("Mandatory details form goes here."),
      ).toBeInTheDocument();
    });
  });
});
