import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { applicationOfferStatusFactory } from "testing/factories/juju/ClientV6";
import {
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelDataMachineFactory,
  modelDataUnitFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import DestroyModelDialog from "./DestroyModelDialog";

describe("DestroyModelDialog", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelDataInfoFactory.build({
              name: "test-model",
            }),
            storage: [
              {
                "storage-tag": "storage-easyrsa-0",
                kind: 0,
                "owner-tag": "admin",
                persistent: true,
                status: {
                  info: "",
                  since: "",
                  status: "",
                },
              },
            ],
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                units: {
                  "easyrsa/0": modelDataUnitFactory.build(),
                },
              }),
            },
            machines: {
              "0": modelDataMachineFactory.build(),
            },
          }),
        },
      }),
    });
  });

  it("does not render information table when model is empty", () => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {},
      }),
    });
    renderComponent(
      <DestroyModelDialog
        modelName="model123"
        modelUUID="abc123"
        closePortal={vi.fn()}
      />,
      { state },
    );
    const destroyModelDialog = screen.getByTestId("destroy-model-dialog");
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("dialog", {
        name: "Destroy model model123",
      }),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).queryByTestId("model-status-info"),
    ).toBeNull();
  });

  it("renders the full info table when model contains all data types", () => {
    renderComponent(
      <DestroyModelDialog
        modelName="model123"
        modelUUID="abc123"
        closePortal={vi.fn()}
      />,
      { state },
    );

    const destroyModelDialog = screen.getByTestId("destroy-model-dialog");
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByTestId("model-status-info"),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Applications \(1\)/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Machines \(1\)/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Model has attached storage/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByLabelText("Destroy storage"),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByLabelText("Detach storage"),
    ).toBeInTheDocument();
  });

  it("disables confirm button when connected offers exist", () => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            offers: {
              http: applicationOfferStatusFactory.build({
                "total-connected-count": 2,
              }),
            },
          }),
        },
      }),
    });

    renderComponent(
      <DestroyModelDialog
        modelName="model123"
        modelUUID="abc123"
        closePortal={vi.fn()}
      />,
      { state },
    );

    const destroyModelDialog = screen.getByTestId("destroy-model-dialog");
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(
        /Offer is being consumed. Remove offer from the consuming model to delete this model./,
      ),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("button", { name: "Destroy model" }),
    ).toBeDisabled();
  });

  it("dispatches destroyModels with 'destroy-storage: true' when destroy option is selected", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const mockClosePortal = vi.fn();
    renderComponent(
      <DestroyModelDialog
        modelName="model123"
        modelUUID="abc123"
        closePortal={mockClosePortal}
      />,
      { state, store },
    );

    const destroyModelsAction = jujuActions.destroyModels({
      models: [
        {
          "model-tag": "model-abc123",
          "destroy-storage": true,
          modelUUID: "abc123",
        },
      ],
      wsControllerURL: "",
    });

    // Since the "Destroy" option is rendered pre-selected, we select the "Detach" first
    // to allow testing the callback for "Destroy"
    await userEvent.click(screen.getByLabelText("Detach storage"));
    await userEvent.click(screen.getByLabelText("Destroy storage"));
    await userEvent.click(
      screen.getByRole("button", { name: "Destroy model" }),
    );

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === destroyModelsAction.type),
      ).toMatchObject(destroyModelsAction);
    });
    expect(mockClosePortal).toHaveBeenCalledTimes(1);
  });

  it("dispatches destroyModels with 'destroy-storage: false' when detach option is selected", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const mockClosePortal = vi.fn();
    renderComponent(
      <DestroyModelDialog
        modelName="model123"
        modelUUID="abc123"
        closePortal={mockClosePortal}
      />,
      { state, store },
    );

    const destroyModelsAction = jujuActions.destroyModels({
      models: [
        {
          "model-tag": "model-abc123",
          "destroy-storage": false,
          modelUUID: "abc123",
        },
      ],
      wsControllerURL: "",
    });

    await userEvent.click(screen.getByLabelText("Detach storage"));
    await userEvent.click(
      screen.getByRole("button", { name: "Destroy model" }),
    );

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === destroyModelsAction.type),
      ).toMatchObject(destroyModelsAction);
    });
    expect(mockClosePortal).toHaveBeenCalledTimes(1);
  });
});
