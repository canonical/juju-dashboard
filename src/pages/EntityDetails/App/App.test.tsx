import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { TestId as InfoPanelTestId } from "components/InfoPanel/InfoPanel";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import {
  credentialFactory,
  generalStateFactory,
  configFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  modelWatcherModelDataFactory,
  applicationInfoFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";

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
  let storeData: RootState;

  beforeEach(() => {
    storeData = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        credentials: {
          "wss://jimm.jujucharms.com/api": credentialFactory.build(),
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "canonical-kubernetes",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              etcd: applicationInfoFactory.build(),
            },
            units: {
              "0": unitChangeDeltaFactory.build({
                application: "etcd",
                name: "etcd/0",
                "charm-url": "cs:etcd-50",
              }),
              "1": unitChangeDeltaFactory.build({
                application: "etcd",
                name: "etcd/1",
                "charm-url": "cs:etcd-51",
              }),
            },
          }),
        },
      }),
    });
  });

  function generateComponent(data = storeData) {
    const store = mockStore(data);
    window.history.pushState(
      {},
      "",
      "/models/eggman@external/canonical-kubernetes/app/etcd"
    );
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName"
              element={<App />}
            />
            {/* Capture other paths to prevent warnings when navigating in the tests. */}
            <Route path="*" element={<span />} />
          </Routes>
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
    await userEvent.click(screen.getByRole("link", { name: "machines" }));
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

    expect(window.location.search).toEqual("?panel=execute-action&units=0%2C1");
  });

  it("navigates to the actions log when button pressed", async () => {
    generateComponent();
    await userEvent.click(screen.getByTestId(TestId.SHOW_ACTION_LOGS));
    expect(window.location.search).toEqual("?activeView=action-logs");
  });

  it("does not fail if a subordinate is not related to another application", async () => {
    const modelWatcherData = storeData.juju.modelWatcherData;
    if (modelWatcherData && "abc123" in modelWatcherData) {
      modelWatcherData["abc123"].units = {};
    }
    generateComponent(storeData);
    expect(screen.getByText(Label.NO_UNITS)).toBeInTheDocument();
  });
});
