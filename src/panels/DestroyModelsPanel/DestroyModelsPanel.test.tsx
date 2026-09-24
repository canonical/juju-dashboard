import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TestId as BulkDestroyTestId } from "components/BulkDestroyModelDialog/types";
import { TestId as DestroyModelTestId } from "components/DestroyModelDialog/types";
import { DestroyBlockedReason } from "store/juju/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import { Label as AccordionLabel } from "./AccordionContent/types";
import DestroyModelsPanel from "./DestroyModelsPanel";
import { Label } from "./types";

describe("DestroyModelsPanel", () => {
  let state: RootState;
  const url = "/?panel=destroy-models";

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
    renderComponent(<DestroyModelsPanel />, { state, url });
    expect(
      screen.getByRole("heading", { name: "Review 2 models" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    ).toBeInTheDocument();
  });

  it("renders an accordion section for each selected model", () => {
    renderComponent(<DestroyModelsPanel />, { state, url });
    const headings = screen.getAllByRole("heading");
    expect(within(headings[1]).getByText("test-model-1")).toBeInTheDocument();
    expect(within(headings[2]).getByText("test-model-2")).toBeInTheDocument();
  });

  it("closes the panel and clears the store selection when Cancel is clicked", async () => {
    const { router, store } = renderComponent(<DestroyModelsPanel />, {
      state,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.CANCEL }));
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("panel")).toBeNull();
    expect(store.getState().juju.modelsSelectedForDestruction).toStrictEqual(
      [],
    );
  });

  it("updates footer summary", async () => {
    renderComponent(<DestroyModelsPanel />, { state, url });
    expect(screen.getByText("0/1 Reviewed, 1 Skipped.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /test-model-2/ }));
    await userEvent.click(
      screen.getByRole("button", { name: AccordionLabel.MARK_REVIEWED }),
    );
    await waitFor(() => {
      expect(screen.getByText("1/1 Reviewed, 1 Skipped.")).toBeInTheDocument();
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
    renderComponent(<DestroyModelsPanel />, { state, url });
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
    renderComponent(<DestroyModelsPanel />, { state, url });
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
    renderComponent(<DestroyModelsPanel />, { state, url });
    await userEvent.click(
      screen.getByRole("button", { name: Label.COMPLETE_REVIEW_DESTROY }),
    );
    expect(screen.getByTestId(BulkDestroyTestId.DIALOG)).toBeInTheDocument();
  });
});
