import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import {
  additionalControllerFactory,
  controllerFactory,
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelDataUnitFactory,
} from "testing/factories/juju/juju";
import { machineChangeDeltaFactory } from "testing/factories/juju/model-watcher";
import { rootStateFactory } from "testing/factories/root";

import ControllersIndex, { Label } from "./ControllersIndex";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders a blank page if no data", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.queryByRole("row")).not.toBeInTheDocument();
  });

  it("renders the correct number of rows", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
          controllerFactory.build({ path: "admin/jaas2", uuid: "456" }),
        ],
      },
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("displays additional controllers", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
          additionalControllerFactory.build(),
        ],
      },
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    const tables = screen.getAllByRole("grid");
    expect(tables).toHaveLength(2);
    const additionalRows = within(tables[1]).getAllByRole("row");
    expect(additionalRows).toHaveLength(2);
    expect(additionalRows[1]).toHaveTextContent(
      [
        "wss://jimm.jujucharms.com/api",
        "unknown/unknown",
        "0",
        "0",
        "0",
        "0",
        "Private",
      ].join("")
    );
  });

  it("counts models, machines, apps, and units", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            path: "admin/jaas",
            uuid: "controller123",
          }),
        ],
      },
      modelData: {
        abc123: modelDataFactory.build({
          info: modelDataInfoFactory.build({
            "controller-uuid": "controller123",
          }),
          machines: {
            "0": machineChangeDeltaFactory.build(),
            "1": machineChangeDeltaFactory.build(),
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
            "controller-uuid": "controller123",
          }),
          machines: {
            "0": machineChangeDeltaFactory.build(),
            "1": machineChangeDeltaFactory.build(),
            "2": machineChangeDeltaFactory.build(),
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
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row")[1]).toHaveTextContent(
      ["JAAS", "Multiple", "2", "5", "2", "3", "Private"].join("")
    );
  });

  it("handles cloud/region for JAAS", () => {
    state.juju = jujuStateFactory.build({
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({ path: "admin/jaas", uuid: "123" }),
        ],
      },
      models: {},
    });
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    expect(
      screen.getByRole("gridcell", { name: "Multiple" })
    ).toBeInTheDocument();
  });

  it("shows 'Register new controller' panel", async () => {
    const store = mockStore(state);
    window.history.pushState({}, "", "/controllers");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ControllersIndex />
        </BrowserRouter>
      </Provider>
    );
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
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ControllersIndex />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("update-available")).toHaveLength(2);
  });
});
