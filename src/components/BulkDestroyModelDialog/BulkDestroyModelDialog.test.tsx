import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationStatusFactory,
  unitStatusFactory,
  machineStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  modelSelectionParamsFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import BulkDestroyModelDialog from "./BulkDestroyModelDialog";
import { TestId } from "./types";

describe("BulkDestroyModelDialog", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com:17070/api",
        }),
      }),
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({
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
              easyrsa: applicationStatusFactory.build({
                units: {
                  "easyrsa/0": unitStatusFactory.build(),
                },
              }),
            },
            machines: {
              "0": machineStatusFactory.build(),
            },
          }),
          def456: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({
              name: "test-model2",
            }),
            applications: {
              "ceph-mon": applicationStatusFactory.build(),
            },
          }),
        },
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
            skipped: false,
            reviewed: true,
          }),
          modelSelectionParamsFactory.build({
            modelUUID: "def456",
            modelName: "test-model-2",
            skipped: false,
            reviewed: true,
          }),
        ],
      }),
    });
  });

  it("renders properly", () => {
    renderComponent(
      <BulkDestroyModelDialog
        closePortal={vi.fn()}
        afterConfirmClicked={vi.fn()}
      />,
      { state },
    );

    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByTestId(TestId.MODELS_RESOURCES),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/2 Models/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/2 Applications/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/1 Machine/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/1 Attached storage/),
    ).toBeInTheDocument();
  });

  it("renders a warning when some models are not reviewed", () => {
    state.juju.modelsSelectedForDestruction[0] =
      modelSelectionParamsFactory.build({
        modelUUID: "abc123",
        reviewed: false,
      });
    renderComponent(
      <BulkDestroyModelDialog
        closePortal={vi.fn()}
        afterConfirmClicked={vi.fn()}
      />,
      { state },
    );

    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(
        "1/2 models have not been reviewed.",
      ),
    ).toBeInTheDocument();
  });

  it("disables confirm button until the prompt is entered correctly", async () => {
    renderComponent(
      <BulkDestroyModelDialog
        closePortal={vi.fn()}
        afterConfirmClicked={vi.fn()}
      />,
      { state },
    );

    // Confirm that the button is rendered disabled by default
    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("button", {
        name: "Destroy 2 models",
      }),
    ).toHaveAttribute("aria-disabled");

    // Check that entering wrong prompt validates and keeps the button disabled
    const input = within(destroyModelDialog).getByRole("textbox", {
      name: 'To destroy the models above, enter "destroy 2 models".',
    });
    expect(input).toBeInTheDocument();
    await userEvent.type(input, "destroy 3 models");
    expect(
      within(destroyModelDialog).getByText(
        'Incorrect confirmation, enter "destroy 2 models" to destroy',
      ),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("button", {
        name: "Destroy 2 models",
      }),
    ).toHaveAttribute("aria-disabled");

    // Finally, confirm that typing the right prompt enables the submit
    await userEvent.clear(input);
    await userEvent.type(input, "destroy 2 models");
    expect(
      within(destroyModelDialog).getByRole("button", {
        name: "Destroy 2 models",
      }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("dispatches destroyModels with 'destroy-storage: true' when destroying a model with storage", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const mockClosePortal = vi.fn();
    const mockAfterConfirmClicked = vi.fn();
    renderComponent(
      <BulkDestroyModelDialog
        afterConfirmClicked={mockAfterConfirmClicked}
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
          modelName: "test-model-1",
        },
        {
          "model-tag": "model-def456",
          modelName: "test-model-2",
          modelUUID: "def456",
        },
      ],
      wsControllerURL: "wss://example.com:17070/api",
    });

    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    const input = within(destroyModelDialog).getByRole("textbox", {
      name: 'To destroy the models above, enter "destroy 2 models".',
    });
    expect(input).toBeInTheDocument();
    await userEvent.type(input, "destroy 2 models");

    await userEvent.click(
      screen.getByRole("button", { name: "Destroy 2 models" }),
    );
    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === destroyModelsAction.type),
      ).toMatchObject(destroyModelsAction);
    });
    expect(mockAfterConfirmClicked).toHaveBeenCalledTimes(1);
    expect(mockClosePortal).toHaveBeenCalledTimes(1);
  });
});
