import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
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
import urls from "urls";

import DestroyModelDialog from "./DestroyModelDialog";
import { Label, TestId } from "./types";

describe("DestroyModelDialog", () => {
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
    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("dialog", {
        name: "Destroy model model123",
      }),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).queryByTestId(TestId.MODEL_STATUS_INFO),
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

    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByTestId(TestId.MODEL_STATUS_INFO),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Applications \(1\)/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Machines \(1\)/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/Attached storage \(1\)/),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(/easyrsa\/0/),
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

    const destroyModelDialog = screen.getByTestId(TestId.DIALOG);
    expect(destroyModelDialog).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByText(
        /Offer is being consumed. Remove offer from the consuming model to delete this model./,
      ),
    ).toBeInTheDocument();
    expect(
      within(destroyModelDialog).getByRole("button", { name: Label.DESTROY }),
    ).toBeDisabled();
  });

  it("dispatches destroyModels with 'destroy-storage: true' when destroying a model with storage", async () => {
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
          modelName: "model123",
        },
      ],
      wsControllerURL: "wss://example.com:17070/api",
    });

    await userEvent.click(screen.getByRole("button", { name: Label.DESTROY }));
    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === destroyModelsAction.type),
      ).toMatchObject(destroyModelsAction);
    });
    expect(mockClosePortal).toHaveBeenCalledTimes(1);
  });

  it("can redirect after destroying", async () => {
    const { router } = renderComponent(
      <DestroyModelDialog
        closePortal={vi.fn()}
        modelName="model123"
        modelUUID="abc123"
        redirectOnDestroy
      />,
      {
        state,
        path: urls.model.index(null),
        url: urls.model.index({
          userName: "user@external",
          modelName: "test-model",
        }),
      },
    );
    await userEvent.click(screen.getByRole("button", { name: Label.DESTROY }));
    expect(router.state.location.pathname).toBe(urls.models.index);
  });
});
