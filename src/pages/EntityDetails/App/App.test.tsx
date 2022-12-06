import { TSFixMe } from "@canonical/react-components";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import cloneDeep from "clone-deep";

import { TestId as InfoPanelTestId } from "components/InfoPanel/InfoPanel";
import dataDump from "testing/complete-redux-store-dump";
import { ReduxState } from "types";
import { reduxStateFactory } from "testing/redux-factory";

import App, { Label, TestId } from "./App";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

describe("Entity Details App", () => {
  let storeData: ReduxState;

  beforeEach(() => {
    storeData = reduxStateFactory().build(
      {},
      {
        transient: {
          models: Object.values(dataDump.juju.modelData).map((model) => ({
            name: model.info.name,
            owner: model.info["owner-tag"].replace("user-", ""),
            uuid: model.uuid,
          })),
        },
      }
    );
    storeData.general.credentials = {
      "wss://jimm.jujucharms.com/api": {
        info: { user: { identity: "user-eggman@external" } },
      },
    };
    storeData.juju.modelData = dataDump.juju.modelData;

    const model = Object.values(storeData.juju.modelWatcherData).find(
      (model) => model.model.name === "canonical-kubernetes"
    );
    if (model && "units" in model) {
      for (let index = 0; index < 2; index++) {
        model.units[index] = {
          "agent-status": {
            current: "idle",
            message: "",
            since: "2021-08-13T19:34:41.247417373Z",
            version: "2.8.7",
          },
          "charm-url": "cs:etcd-55",
          "machine-id": "0",
          "model-uuid": "abc123",
          "port-ranges": null,
          "private-address": "172.31.43.84",
          "public-address": "54.162.156.160",
          "workload-status": {
            current: "blocked",
            message: "Insufficient peer units to bootstrap cluster (require 3)",
            since: "2021-08-13T19:34:37.747827227Z",
            version: "",
          },
          application: "etcd",
          life: "alive",
          name: `etcd/${index}`,
          ports: [],
          principal: "",
          series: "bionic",
          subordinate: false,
        };
      }
    }
  });

  function generateComponent(data = storeData) {
    const store = mockStore(data);
    window.history.pushState(
      {},
      "",
      "/models/pizza@external/canonical-kubernetes/app/etcd"
    );
    render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName/app/:appName"
                element={<App />}
              />
            </Routes>
          </QueryParamProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  it("renders the info panel", async () => {
    generateComponent();
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });

  it("allows you to switch between a unit and machines view", async () => {
    generateComponent();
    expect(screen.getByTestId(TestId.UNITS_TABLE)).toBeInTheDocument();
    expect(screen.queryByTestId(TestId.MACHINES_TABLE)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "view by machines" })
    );
    expect(screen.queryByTestId(TestId.UNITS_TABLE)).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.MACHINES_TABLE)).toBeInTheDocument();
  });

  it("supports selecting and deselecting all units", async () => {
    generateComponent();

    const selectAll = screen.getByTestId(TestId.SELECT_ALL);
    const selectedUnits = [
      screen.getByTestId("table-checkbox-0"),
      screen.getByTestId("table-checkbox-1"),
    ];
    await userEvent.click(selectAll);
    const unitsListChecked = (value: boolean) => {
      selectedUnits.forEach((input) => {
        if (value) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(input).toBeChecked();
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(input).not.toBeChecked();
        }
      });
    };

    await userEvent.click(selectAll);
    // All units get selected when clicking selectAll
    expect(selectAll).not.toBeChecked();
    unitsListChecked(false);
    await userEvent.click(selectAll);
    unitsListChecked(true);
    expect(selectAll).toBeChecked();

    // All units get de-selected when clicking selectAll
    await userEvent.click(selectAll);
    unitsListChecked(false);

    expect(selectAll).not.toBeChecked();
    // Selecting all units selects the selectAll checkbox
    for (const input of selectedUnits) {
      await userEvent.click(input);
    }
    expect(selectAll).toBeChecked();

    // De-selecting one unit de-selects the selectAll checkbox
    const firstInput = selectedUnits[0];
    await userEvent.click(firstInput);
    expect(selectAll).not.toBeChecked();

    // Clickcing selectAll with partial units selected, selects all
    await userEvent.click(selectAll);
    unitsListChecked(true);
    expect(selectAll).toBeChecked();

    // De-selecting the selectAll deselects all the units.
    await userEvent.click(selectAll);
    unitsListChecked(false);
  });

  it("enable the action button row when a unit is selected", async () => {
    generateComponent();
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).toBeDisabled();
    const firstInput = screen.getByTestId("table-checkbox-0");
    await userEvent.click(firstInput);
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).not.toBeDisabled();
  });

  it("updates the url when units are selected and deselected", async () => {
    generateComponent();

    // Select a single unit.
    const firstInput = screen.getByTestId("table-checkbox-0");
    await userEvent.click(firstInput);

    // Trigger the action panel to open to enable the auto url pushing.
    await userEvent.click(screen.getByTestId(TestId.RUN_ACTION_BUTTON));
    expect(window.location.search).toEqual("?panel=execute-action&units=0");

    // Select another unit and it should update the url.
    const secondInput = screen.getByTestId("table-checkbox-1");
    await userEvent.click(secondInput);

    expect(window.location.search).toEqual(
      "?panel=execute-action&units=0&units=1"
    );
  });

  it("navigates to the actions log when button pressed", async () => {
    generateComponent();
    await userEvent.click(screen.getByTestId(TestId.SHOW_ACTION_LOGS));
    expect(window.location.search).toBe("?activeView=action-logs");
  });

  it("does not fail if a subordinate is not related to another application", async () => {
    const tweakedData: TSFixMe = cloneDeep(storeData);
    const model: TSFixMe = Object.values(
      tweakedData.juju.modelWatcherData
    ).find((model: TSFixMe) => model.model.name === "canonical-kubernetes");
    model.units = null;
    generateComponent(tweakedData);
    expect(screen.getByText(Label.NO_UNITS)).toBeInTheDocument();
  });
});
