import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TestId as InfoPanelTestId } from "components/InfoPanel/InfoPanel";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  unitChangeDeltaFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";

import App, { Label, TestId } from "./App";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

jest.mock("components/WebCLI/WebCLI", () => {
  const WebCLI = () => <div className="webcli" data-testid="webcli"></div>;
  return WebCLI;
});

describe("Entity Details App", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url = "/models/eggman@external/canonical-kubernetes/app/etcd";

  beforeEach(() => {
    state = rootStateFactory.build({
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

  it("renders the info panel", async () => {
    renderComponent(<App />, { path, url, state });
    expect(screen.getByTestId(InfoPanelTestId.INFO_PANEL)).toBeInTheDocument();
  });

  it("allows you to switch between a unit and machines view", async () => {
    renderComponent(<App />, { path, url, state });
    expect(screen.getByTestId(TestId.UNITS_TABLE)).toBeInTheDocument();
    expect(screen.queryByTestId(TestId.MACHINES_TABLE)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Machines" }));
    expect(screen.queryByTestId(TestId.UNITS_TABLE)).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.MACHINES_TABLE)).toBeInTheDocument();
  });

  it("displays machine column in the unit table", async () => {
    renderComponent(<App />, { path, url, state });
    expect(
      within(screen.getByTestId(TestId.UNITS_TABLE)).getByRole("columnheader", {
        name: "machine",
      })
    ).toBeInTheDocument();
  });

  it("does not display the machine column for k8s", async () => {
    expect(state.juju.modelWatcherData?.abc123.model.type).toBeTruthy();
    if (state.juju.modelWatcherData?.abc123.model.type) {
      state.juju.modelWatcherData.abc123.model.type = "kubernetes";
    }
    renderComponent(<App />, { path, url, state });
    expect(
      within(screen.getByTestId(TestId.UNITS_TABLE)).queryByRole(
        "columnheader",
        {
          name: "machine",
        }
      )
    ).not.toBeInTheDocument();
  });

  it("supports selecting and deselecting all units", async () => {
    renderComponent(<App />, { path, url, state });

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

    // Clicking selectAll with partial units selected, selects all
    await userEvent.click(selectAll);
    unitsListChecked(true);
    expect(selectAll).toBeChecked();

    // De-selecting the selectAll deselects all the units.
    await userEvent.click(selectAll);
    unitsListChecked(false);
  });

  it("enable the action button row when a unit is selected", async () => {
    renderComponent(<App />, { path, url, state });
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).toBeDisabled();
    const firstInput = screen.getByTestId("table-checkbox-0");
    await userEvent.click(firstInput);
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).not.toBeDisabled();
  });

  it("updates the url when units are selected and deselected", async () => {
    renderComponent(<App />, { path, url, state });

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
    renderComponent(<App />, { path, url, state });
    await userEvent.click(screen.getByTestId(TestId.SHOW_ACTION_LOGS));
    expect(window.location.search).toEqual("?activeView=action-logs");
  });

  it("does not fail if a subordinate is not related to another application", async () => {
    const modelWatcherData = state.juju.modelWatcherData;
    if (modelWatcherData && "abc123" in modelWatcherData) {
      modelWatcherData["abc123"].units = {};
    }
    renderComponent(<App />, { path, url, state });
    expect(screen.getByText(Label.NO_UNITS)).toBeInTheDocument();
  });

  it("can display the config panel", async () => {
    renderComponent(<App />, { path, url, state });
    expect(window.location.search).toEqual("");
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIGURE })
    );
    expect(window.location.search).toEqual(
      "?panel=config&entity=etcd&charm=cs%3Aceph-mon-55&modelUUID=abc123"
    );
  });
});
