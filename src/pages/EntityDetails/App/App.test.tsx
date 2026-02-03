import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { JSX } from "react";
import { vi } from "vitest";

import { TestId as InfoPanelTestId } from "components/InfoPanel/types";
import * as componentUtils from "components/utils";
import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  configFactory,
  credentialFactory,
  generalStateFactory,
} from "testing/factories/general";
import {
  applicationStatusFactory,
  machineStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV7";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV9";
import {
  modelListInfoFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import App from "./App";
import { Label, TestId } from "./types";

vi.mock("components/Topology", () => {
  const Topology = (): JSX.Element => <div className="topology"></div>;
  return { default: Topology };
});

vi.mock("components/WebCLI", () => {
  const WebCLI = (): JSX.Element => <div className="webcli"></div>;
  return { default: WebCLI };
});

vi.mock("components/utils", async () => {
  const utils = await vi.importActual("components/utils");
  return {
    ...utils,
    copyToClipboard: vi.fn(),
  };
});

describe("Entity Details App", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url = "/models/eggman@external/canonical-kubernetes/app/etcd";

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        }),
        credentials: {
          "wss://jimm.jujucharms.com/api": credentialFactory.build(),
        },
        controllerConnections: {
          "wss://jimm.jujucharms.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          test123: modelListInfoFactory.build({
            uuid: "test123",
            name: "canonical-kubernetes",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        modelData: {
          test123: modelDataFactory.build({
            applications: {
              etcd: applicationStatusFactory.build({
                units: {
                  "etcd/0": unitStatusFactory.build({
                    charm: "cs:etcd-50",
                    "public-address": "54.162.156.160",
                    machine: "0",
                  }),
                  "etcd/1": unitStatusFactory.build({
                    charm: "cs:etcd-51",
                    machine: "1",
                  }),
                },
              }),
              mysql: applicationStatusFactory.build({
                units: {
                  "mysql/0": unitStatusFactory.build({
                    charm: "cs:mysql-50",
                    "public-address": "54.162.156.160",
                    machine: "0",
                  }),
                  "mysql/1": unitStatusFactory.build({
                    charm: "cs:mysql-51",
                    machine: "3",
                  }),
                },
              }),
            },
            info: modelInfoFactory.build({
              uuid: "test123",
              name: "canonical-kubernetes",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
            machines: {
              0: machineStatusFactory.build(),
              1: machineStatusFactory.build(),
              2: machineStatusFactory.build(),
              3: machineStatusFactory.build(),
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

  it("displays units", async () => {
    renderComponent(<App />, { path, url, state });
    const table = screen.getByTestId(TestId.UNITS_TABLE);
    const rows = within(table).getAllByRole("row");
    // The table should only contain the units from the selected app.
    expect(rows).toHaveLength(
      Object.keys(state.juju.modelData.test123.applications.etcd.units).length +
        1,
    );
  });

  it("displays machines", async () => {
    renderComponent(<App />, { path, url, state });
    await userEvent.click(screen.getByRole("tab", { name: "Machines" }));
    const table = screen.getByTestId(TestId.MACHINES_TABLE);
    const rows = within(table).getAllByRole("row");
    // The table should only contain the units from the selected app.
    expect(rows).toHaveLength(3);
  });

  it("displays machine column in the unit table", async () => {
    renderComponent(<App />, { path, url, state });
    expect(
      within(screen.getByTestId(TestId.UNITS_TABLE)).getByRole("columnheader", {
        name: "machine",
      }),
    ).toBeInTheDocument();
  });

  it("does not display the machine column for k8s", async () => {
    expect(state.juju.modelData?.test123.model.type).toBeTruthy();
    if (state.juju.modelData?.test123.info?.type) {
      state.juju.modelData.test123.info.type = "kubernetes";
    }
    renderComponent(<App />, { path, url, state });
    expect(
      within(screen.getByTestId(TestId.UNITS_TABLE)).queryByRole(
        "columnheader",
        {
          name: "machine",
        },
      ),
    ).not.toBeInTheDocument();
  });

  it("supports selecting and deselecting all units", async () => {
    renderComponent(<App />, { path, url, state });

    const selectAll = screen.getByTestId(TestId.SELECT_ALL);
    const selectedUnits = [
      screen.getByTestId("table-checkbox-etcd/0"),
      screen.getByTestId("table-checkbox-etcd/1"),
    ];
    await userEvent.click(selectAll);
    const unitsListChecked = (value: boolean): void => {
      selectedUnits.forEach((input) => {
        if (value) {
          expect(input).toBeChecked();
        } else {
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
    const [firstInput] = selectedUnits;
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
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).toHaveAttribute(
      "aria-disabled",
    );
    const firstInput = screen.getByTestId("table-checkbox-etcd/0");
    await userEvent.click(firstInput);
    expect(screen.getByTestId(TestId.RUN_ACTION_BUTTON)).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("updates the url when units are selected and deselected", async () => {
    const { router } = renderComponent(<App />, { path, url, state });

    // Select a single unit.
    const firstInput = screen.getByTestId("table-checkbox-etcd/0");
    await userEvent.click(firstInput);

    // Trigger the action panel to open to enable the auto url pushing.
    await userEvent.click(screen.getByTestId(TestId.RUN_ACTION_BUTTON));
    expect(router.state.location.search).toEqual(
      "?panel=execute-action&units=etcd%2F0",
    );

    // Select another unit and it should update the url.
    const secondInput = screen.getByTestId("table-checkbox-etcd/1");
    await userEvent.click(secondInput);

    expect(router.state.location.search).toEqual(
      // spell-checker:disable-next-line
      "?panel=execute-action&units=etcd%2F0%2Cetcd%2F1",
    );
  });

  it("navigates to the actions log when button pressed", async () => {
    const { router } = renderComponent(<App />, { path, url, state });
    await userEvent.click(screen.getByTestId(TestId.SHOW_LOGS));
    expect(router.state.location.search).toEqual("?activeView=logs");
  });

  it("does not fail if a subordinate is not related to another application", async () => {
    const { modelData } = state.juju;
    if (modelData && "test123" in modelData) {
      modelData["test123"].applications = {
        etcd: {
          ...modelData["test123"].applications.etcd,
          units: {},
        },
      };
    }
    renderComponent(<App />, { path, url, state });
    expect(screen.getByText(Label.NO_UNITS)).toBeInTheDocument();
  });

  it("can display the config panel", async () => {
    const { router } = renderComponent(<App />, { path, url, state });
    expect(router.state.location.search).toEqual("");
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIGURE }),
    );
    expect(router.state.location.search).toEqual(
      // spell-checker:disable-next-line
      "?panel=config&entity=etcd&charm=cs%3A%7Econtainers%2Feasyrsa-278&modelUUID=test123",
    );
  });

  it("should not display the config button if the user only has read permissions", async () => {
    state.juju.modelData.test123.info = modelInfoFactory.build({
      uuid: "test123",
      name: "canonical-kubernetes",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    const { router } = renderComponent(<App />, { path, url, state });
    expect(router.state.location.search).toEqual("");
    expect(
      screen.queryByRole("button", { name: Label.CONFIGURE }),
    ).not.toBeInTheDocument();
  });

  it("should not display the checkboxes or run action button if the user only has read permissions", async () => {
    state.juju.modelData.test123.info = modelInfoFactory.build({
      uuid: "test123",
      name: "canonical-kubernetes",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "read",
        }),
      ],
    });
    const { router } = renderComponent(<App />, { path, url, state });
    expect(router.state.location.search).toEqual("");
    expect(
      screen.queryByRole("button", { name: Label.RUN_ACTION }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("copies the address", async () => {
    renderComponent(<App />, { path, url, state });
    await userEvent.click(screen.getAllByRole("button", { name: "Copy" })[0]);
    expect(componentUtils.copyToClipboard).toHaveBeenCalledWith(
      "54.162.156.160",
    );
  });
});
