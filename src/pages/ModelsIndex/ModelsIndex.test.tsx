import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { DestroyModelDialogTestId } from "components/DestroyModelDialog";
import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import * as useCanConfigureModelModule from "hooks/useCanConfigureModel";
import { actions as jujuActions } from "store/juju";
import { DestroyBlockedReason } from "store/juju/types";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationStatusFactory,
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";
import urls from "urls";

import ModelsIndex from "./ModelsIndex";
import { Label, TestId } from "./types";

// spell-checker:words groupedby

describe("Models Index page", () => {
  let state: RootState;

  beforeEach(() => {
    vi.spyOn(
      useCanConfigureModelModule,
      "useCanConfigureModelWithUUID",
    ).mockReturnValue(false);
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
            canConfigure: true,
          }),
        },
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
              name: "abc123",
            }),
            applications: {
              easyrsa: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            uuid: "def456",
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-gce",
              name: "def456",
            }),
            applications: {
              cockroachdb: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "running",
                }),
              }),
            },
          }),
          ghi789: modelDataFactory.build({
            uuid: "ghi789",
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
              name: "ghi789",
            }),
            applications: {
              elasticsearch: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "unknown",
                }),
              }),
            },
          }),
        },
        modelsLoaded: true,
      }),
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
    });
  });

  it("renders without crashing", () => {
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/3 models/)).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(document.querySelector(".chip-group")).toBeInTheDocument();
  });

  it("displays a spinner while loading models", () => {
    state.juju.modelsLoaded = false;
    renderComponent(<ModelsIndex />, { state });
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
  });

  it("displays a message if there are no models", () => {
    state.juju.models = {};
    renderComponent(<ModelsIndex />, { state });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND }),
    ).toBeInTheDocument();
  });

  it("displays correct grouping view", async () => {
    const { router } = renderComponent(<ModelsIndex />, {
      state,
      path: urls.models.index,
      url: urls.models.group({ groupedby: "status" }),
    });

    expect(screen.getByRole("tab", { name: "status" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const ownerButton = screen.getByRole("tab", { name: "owner" });
    await userEvent.click(ownerButton);
    expect(ownerButton).toHaveAttribute("aria-selected", "true");
    const searchParams = new URLSearchParams(router.state.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");

    // Find the header, and ensure that it's the first child.
    const header = screen.getByRole("columnheader", { name: "Owner" });
    expect(header.parentElement?.children[0]).toEqual(header);
  });

  it("should display the correct window title", () => {
    renderComponent(<ModelsIndex />, { state });
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });

  it.for([
    ["aws", 2],
    ["gce", 1],
  ] as const)(
    "can filter models via the URL (cloud = %s)",
    ([cloud, count], { expect }) => {
      const params = new URLSearchParams({
        cloud,
      });
      renderComponent(<ModelsIndex />, { state, url: `?${params.toString()}` });
      expect(screen.getAllByRole("table")).toHaveLength(1);
      expect(screen.getAllByRole("row")).toHaveLength(count + 1);
      expect(
        screen.getAllByRole("cell", { name: `${cloud}/us-east1` }),
      ).toHaveLength(count);
    },
  );

  it("can change model filters", async () => {
    const { router } = renderComponent(<ModelsIndex />, { state });
    expect(screen.getAllByRole("table")).toHaveLength(1);
    // 3 values + header
    expect(screen.getAllByRole("row")).toHaveLength(4);
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));
    expect(screen.getAllByRole("table")).toHaveLength(1);
    // 2 values + header
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("cell", { name: `aws/us-east1` })).toHaveLength(
      2,
    );
    const params = new URLSearchParams({
      cloud: "aws",
      owner: "",
      region: "",
      credential: "",
      custom: "",
    });
    expect(router.state.location.search).toBe(`?${params.toString()}`);
  });

  it("should display the error notification without clearing table", async () => {
    state.juju.modelsError = "Oops!";
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/Oops!/)).toBeInTheDocument();
    expect(screen.getByText(/3 models/)).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  it("clears spinner if initial error occurs", async () => {
    state.juju.modelsLoaded = false;
    state.juju.modelsError = "An error occurred";
    const {
      result: { queryAllSpinnersByLabel },
    } = renderComponent(<ModelsIndex />, { state });
    expect(queryAllSpinnersByLabel("Loading")).toHaveLength(0);
    expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    expect(screen.getByTestId(TestId.COMPONENT).childElementCount).toEqual(1);
  });

  it("should refresh the window when pressing the button in error notification", async () => {
    const { location } = window;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });

    state.juju.modelsError = "Oops!";
    renderComponent(<ModelsIndex />, { state });
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      value: location,
    });
  });

  it("should navigate to AddModel page when Add Model button is clicked", async () => {
    const { router } = renderComponent(<ModelsIndex />, { state });
    const addButton = screen.getByRole("button", {
      name: "Add model",
    });
    await userEvent.click(addButton);
    expect(router.state.location.pathname).toEqual(urls.models.addModel);
  });

  describe("Review & destroy button", () => {
    it("is disabled when no models are selected", () => {
      renderComponent(<ModelsIndex />, { state });
      const button = screen.getByRole("button", {
        name: `${Label.DESTROY_MODEL}`,
      });
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("is disabled when the only model selected is controller model", async () => {
      state.juju.modelData["abc123"].info = modelInfoFactory.build({
        "is-controller": true,
      });
      renderComponent(<ModelsIndex />, { state });
      const button = screen.getByRole("button", {
        name: `${Label.DESTROY_MODEL}`,
      });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("is disabled when the user doesn't have access to the only selected model", async () => {
      renderComponent(<ModelsIndex />, { state });
      const button = screen.getByRole("button", {
        name: `${Label.DESTROY_MODEL}`,
      });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("shows count after selecting more than 1 model", async () => {
      renderComponent(<ModelsIndex />, { state });
      // Select the first row checkbox.
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      expect(
        screen.getByRole("button", {
          name: `${Label.REVIEW_AND_DESTROY} 2 models`,
        }),
      ).toBeInTheDocument();
    });

    it("updates count as more models are selected", async () => {
      renderComponent(<ModelsIndex />, { state });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      expect(
        screen.getByRole("button", { name: `${Label.DESTROY_MODEL}` }),
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      expect(
        screen.getByRole("button", {
          name: `${Label.REVIEW_AND_DESTROY} 2 models`,
        }),
      ).toBeInTheDocument();
    });

    it("opens DestroyModelDialog when exactly one model is selected and button is clicked", async () => {
      vi.spyOn(
        useCanConfigureModelModule,
        "useCanConfigureModelWithUUID",
      ).mockReturnValue(true);
      renderComponent(<ModelsIndex />, { state });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      await userEvent.click(
        screen.getByRole("button", { name: `${Label.DESTROY_MODEL}` }),
      );
      expect(
        screen.getByTestId(DestroyModelDialogTestId.DIALOG),
      ).toBeInTheDocument();
    });

    it("sets the panel query param when multiple models are selected and button is clicked", async () => {
      const { router } = renderComponent(<ModelsIndex />, { state });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      await userEvent.click(
        screen.getByRole("button", {
          name: `${Label.REVIEW_AND_DESTROY} 2 models`,
        }),
      );
      const params = new URLSearchParams(router.state.location.search);
      expect(params.get("panel")).toBe("destroy-models");
    });

    it("clears local selection when the store's selectedModelsForDestruction is cleared", async () => {
      const [store] = createStore(state, { trackActions: true });
      renderComponent(<ModelsIndex />, { state, store });

      // Select two models so the button shows the multi-model label.
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      expect(
        screen.getByRole("button", {
          name: `${Label.REVIEW_AND_DESTROY} 2 models`,
        }),
      ).toBeInTheDocument();

      // Simulate the store clearing its selection (e.g. after the panel closes).
      store.dispatch(jujuActions.clearSelectedModelsForDestruction());

      // The local selection should be cleared and the button should revert to its
      // default single-model label and be disabled.
      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: Label.DESTROY_MODEL,
        });
        expect(button).toHaveAttribute("aria-disabled", "true");
      });
    });

    it("dispatches selectModelsForDestruction action with correct fields for each selected model", async () => {
      vi.spyOn(
        useCanConfigureModelModule,
        "useCanConfigureModelWithUUID",
      ).mockReturnValue(true);
      const [store, actions] = createStore(state, { trackActions: true });
      renderComponent(<ModelsIndex />, { state, store });
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect def456" }),
      );
      await userEvent.click(
        screen.getByRole("checkbox", { name: "Deselect abc123" }),
      );
      await userEvent.click(
        screen.getByRole("button", {
          name: `${Label.REVIEW_AND_DESTROY} 2 models`,
        }),
      );
      const selectModelsForDestructionAction =
        jujuActions.selectModelsForDestruction({
          models: [
            {
              modelName: "def456",
              modelUUID: "def456",
              destroyBlockedReason: DestroyBlockedReason.NO_ACCESS,
              skipped: true,
            },
            {
              destroyBlockedReason: null,
              modelUUID: "abc123",
              modelName: "abc123",
              skipped: false,
            },
          ],
          wsControllerURL: "wss://controller.example.com",
        });
      await waitFor(() => {
        expect(
          actions.find(
            (dispatch) =>
              dispatch.type === selectModelsForDestructionAction.type,
          ),
        ).toMatchObject(selectModelsForDestructionAction);
      });
    });
  });
});
