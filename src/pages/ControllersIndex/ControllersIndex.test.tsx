import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JAAS_CONTROLLER_UUID } from "store/juju/utils/controllers";
import type { RootState } from "store/store";
import { generalStateFactory } from "testing/factories/general";
import {
  additionalControllerFactory,
  controllerFactory,
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelDataUnitFactory,
  modelDataMachineFactory,
  controllerInfoFactory,
} from "testing/factories/juju/juju";
import { connectionInfoFactory } from "testing/factories/juju/jujulib";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import ControllersIndex, { Label } from "./ControllersIndex";

describe("Controllers table", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders a blank page if no data", () => {
    renderComponent(<ControllersIndex />, { state });
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("renders the correct number of rows", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
          controllerFactory.build({ path: "admin/jaas2", uuid: "456" }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("displays additional controllers", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build({}),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
          additionalControllerFactory.build(),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    const tables = screen.getAllByRole("grid");
    expect(tables).toHaveLength(2);
    const additionalRows = within(tables[1]).getAllByRole("row");
    expect(additionalRows).toHaveLength(2);
    expect(additionalRows[1]).toHaveTextContent(
      [
        "jimm.jujucharms.com",
        "Connected",
        "unknown/unknown",
        "0",
        "0",
        "0",
        "0",
      ].join("")
    );
  });

  it("displays additional controllers from JIMM", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build(),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build(),
          controllerInfoFactory.build({ additionalController: true }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    const tables = screen.getAllByRole("grid");
    expect(tables).toHaveLength(2);
    const additionalRows = within(tables[1]).getAllByRole("row");
    expect(additionalRows).toHaveLength(2);
    expect(additionalRows[1]).toHaveTextContent(
      [
        "controller1",
        "Connected",
        "unknown/unknown",
        "0",
        "0",
        "0",
        "0",
        "1.2.3",
      ].join("")
    );
  });

  it("counts models, machines, apps, and units", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build(),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            uuid: JAAS_CONTROLLER_UUID,
          }),
        ],
      },
      modelData: {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "controller-uuid": JAAS_CONTROLLER_UUID,
          }),
          machines: {
            "0": modelDataMachineFactory.build(),
            "1": modelDataMachineFactory.build(),
          },
          applications: {
            easyrsa: modelDataApplicationFactory.build({
              units: {
                "easyrsa/0": modelDataUnitFactory.build(),
                "easyrsa/1": modelDataUnitFactory.build(),
              },
            }),
          },
        }),
        def456: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "controller-uuid": JAAS_CONTROLLER_UUID,
          }),
          machines: {
            "0": modelDataMachineFactory.build(),
            "1": modelDataMachineFactory.build(),
            "2": modelDataMachineFactory.build(),
          },
          applications: {
            ceph: modelDataApplicationFactory.build({
              units: {
                "ceph/0": modelDataUnitFactory.build(),
              },
            }),
          },
        }),
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(screen.getAllByRole("row")[1]).toHaveTextContent(
      ["JAAS", "Connected", "Multiple", "2", "5", "2", "3", "1.2.3"].join("")
    );
  });

  it("displays login errors", async () => {
    state.general.loginErrors = {
      "wss://jimm.jujucharms.com/api": "Uh oh!",
    };

    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByRole("gridcell", { name: "Failed to connect" })
    ).toBeInTheDocument();
    await userEvent.hover(screen.getByText("Failed to connect"));
    expect(screen.getByText("Uh oh!")).toBeInTheDocument();
  });

  it("displays authentication required", async () => {
    state.general.controllerConnections = {};
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByRole("gridcell", { name: "Authentication required" })
    ).toBeInTheDocument();
  });

  it("handles cloud/region for JAAS", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
        ],
      },
      models: {},
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByRole("gridcell", { name: "Multiple" })
    ).toBeInTheDocument();
  });

  it("shows 'Register new controller' panel", async () => {
    renderComponent(<ControllersIndex />, { url: "/controllers" });
    await userEvent.click(
      screen.getByRole("button", { name: Label.REGISTER_BUTTON })
    );
    expect(window.location.search).toBe("?panel=register-controller");
    expect(
      document.querySelector(".p-panel.register-controller")
    ).toBeInTheDocument();
  });

  it("Indicates if a controller has an update available", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            uuid: "123",
            version: "1.0.0",
            updateAvailable: true,
          }),
          controllerFactory.build({
            uuid: "234",
            version: "1.0.0",
            updateAvailable: true,
          }),
          controllerFactory.build({
            uuid: "345",
            version: "0.9.9",
            updateAvailable: false,
          }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(screen.getAllByTestId("update-available")).toHaveLength(2);
  });

  it("displays notifications if controllers need authentication", () => {
    state.general = generalStateFactory.withConfig().build({
      visitURLs: ["/auth"],
    });
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            uuid: "123",
            version: "1.0.0",
            updateAvailable: true,
          }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByText(/Controller authentication required/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Authenticate" })
    ).toBeInTheDocument();
  });
});
