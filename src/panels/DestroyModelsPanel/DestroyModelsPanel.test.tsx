import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import DestroyModelsPanel from "./DestroyModelsPanel";

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
          }),
          def456: modelListInfoFactory.build({
            uuid: "def456",
            wsControllerURL: "wss://example.com/api",
          }),
        },
        modelsSelectedForDestruction: [
          modelSelectionParamsFactory.build({
            modelUUID: "abc123",
            modelName: "test-model-1",
          }),
          modelSelectionParamsFactory.build({
            modelUUID: "def456",
            modelName: "test-model-2",
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
      screen.getByRole("button", { name: "Complete review & destroy" }),
    ).toBeInTheDocument();
  });

  it("renders an accordion section for each selected model", () => {
    renderComponent(<DestroyModelsPanel />, { state, url });
    expect(
      screen.getByRole("heading", { name: "test-model-1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "test-model-2" }),
    ).toBeInTheDocument();
  });

  it("closes the panel and clears the store selection when Cancel is clicked", async () => {
    const { router, store } = renderComponent(<DestroyModelsPanel />, {
      state,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("panel")).toBeNull();
    expect(store.getState().juju.modelsSelectedForDestruction).toStrictEqual(
      [],
    );
  });
});
