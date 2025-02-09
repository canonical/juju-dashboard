import { screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UserEvent } from "@testing-library/user-event";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { generalStateFactory } from "testing/factories/general";
import {
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

import ControllersIndex from "./ControllersIndex";

describe("Controllers table", () => {
  let state: RootState;
  let userEventWithTimers: UserEvent;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
    vi.useFakeTimers();
    userEventWithTimers = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a blank page if no data", () => {
    renderComponent(<ControllersIndex />, { state });
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("renders the correct number of rows", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build(),
          controllerFactory.build({ path: "admin/jaas2", uuid: "456" }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("counts models, machines, apps, and units", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build(),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [controllerFactory.build()],
      },
      modelData: {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build(),
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
          info: modelDataInfoFactory.build(),
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
      [
        "admin/jaas",
        "Connected",
        "unknown/unknown",
        "2",
        "5",
        "2",
        "3",
        "1.2.3",
      ].join(""),
    );
  });

  it("displays login errors", async () => {
    state.general.login = {
      errors: { "wss://jimm.jujucharms.com/api": "Uh oh!" },
      loading: false,
    };

    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [controllerFactory.build()],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByRole("gridcell", { name: "Failed to connect" }),
    ).toBeInTheDocument();
    await act(async () => {
      await userEventWithTimers.hover(screen.getByText("Failed to connect"));
      vi.runAllTimers();
    });
    expect(screen.getByText("Uh oh!")).toBeInTheDocument();
  });

  it("displays authentication required", async () => {
    state.general.controllerConnections = {};
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [controllerFactory.build()],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    expect(
      screen.getByRole("gridcell", { name: "Authentication required" }),
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
      screen.getByText(/Controller authentication required/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Authenticate" }),
    ).toBeInTheDocument();
  });

  it("displays correct cloud data for Juju controller", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build(),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            location: { cloud: "cloud-aws", region: "eu-central-1" },
          }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    const tables = screen.getAllByRole("grid");
    const controllerRows = within(tables[0]).getAllByRole("row");
    expect(controllerRows).toHaveLength(2);
    expect(controllerRows[1]).toHaveTextContent(
      [
        "admin/jaas",
        "Connected",
        "cloud-aws/eu-central-1",
        "0",
        "0",
        "0",
        "0",
        "1.2.3",
      ].join(""),
    );
  });

  it("displays correct cloud data for JIMM enabled controller", () => {
    state.general.controllerConnections = {
      "wss://jimm.jujucharms.com/api": connectionInfoFactory.build(),
    };
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerInfoFactory.build({
            "cloud-tag": "cloud-aws",
            "cloud-region": "eu-central-1",
          }),
        ],
      },
    });
    renderComponent(<ControllersIndex />, { state });
    const tables = screen.getAllByRole("grid");
    const controllerRows = within(tables[0]).getAllByRole("row");
    expect(controllerRows).toHaveLength(2);
    expect(controllerRows[1]).toHaveTextContent(
      [
        "controller1",
        "Connected",
        "cloud-aws/eu-central-1",
        "0",
        "0",
        "0",
        "0",
        "1.2.3",
      ].join(""),
    );
  });
});
