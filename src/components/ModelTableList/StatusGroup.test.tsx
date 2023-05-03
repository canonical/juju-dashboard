import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV6";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelDataApplicationFactory,
  modelDataStatusFactory,
  modelDataUnitFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";

import StatusGroup from "./StatusGroup";

const mockStore = configureStore([]);

describe("StatusGroup", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
            info: modelDataInfoFactory.build({
              "controller-uuid": "controller123",
              uuid: "abc123",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            uuid: "abc123",
          }),
          def456: modelDataFactory.build({
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
          }),
          ghi789: modelDataFactory.build({
            applications: {
              elasticsearch: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "unknown",
                }),
              }),
            },
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-google",
            }),
          }),
          jkl101112: modelDataFactory.build({
            applications: {
              kibana: modelDataApplicationFactory.build({
                status: modelDataStatusFactory.build({
                  status: "running",
                }),
              }),
            },
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-google",
            }),
          }),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
      }),
    });
  });

  it("by default, renders no tables when there is no data", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={{}} />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("displays model data grouped by status from the redux store", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={{}} />
        </Provider>
      </MemoryRouter>
    );
    const tables = screen.getAllByRole("grid");
    expect(tables.length).toBe(3);
    expect(within(tables[0]).getAllByRole("row")).toHaveLength(3);
    expect(within(tables[1]).getAllByRole("row")).toHaveLength(2);
    expect(within(tables[2]).getAllByRole("row")).toHaveLength(2);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(state);
    const filters = {
      cloud: ["aws"],
    };
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={filters} />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByRole("row").length).toBe(3);
  });

  it("displays the provider type icon", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={{}} />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("provider-logo")[0]).toHaveAttribute(
      "src",
      "gce.svg"
    );
  });

  it("model access buttons are present in status group", () => {
    state.general = generalStateFactory.build({
      config: configFactory.build({
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
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
    });
    state.juju.modelData.abc123.info = modelDataInfoFactory.build({
      "cloud-tag": "cloud-aws",
      "controller-uuid": "controller123",
      users: [
        modelUserInfoFactory.build({
          user: "eggman@external",
          access: "admin",
        }),
      ],
    });
    const store = mockStore(state);
    const filters = {
      cloud: ["aws"],
    };
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={filters} />
        </Provider>
      </MemoryRouter>
    );
    const firstContentRow = screen.getAllByRole("row")[1];
    const modelAccessButton = within(firstContentRow).getAllByRole("button", {
      name: "Access",
    });
    expect(modelAccessButton.length).toBe(2);
    expect(within(firstContentRow).getAllByRole("gridcell")[7]).toHaveClass(
      "sm-screen-access-cell"
    );
    expect(within(firstContentRow).getAllByRole("gridcell")[6]).toHaveClass(
      "lrg-screen-access-cell"
    );
  });

  it("displays links to blocked apps and units", async () => {
    state.juju.modelData.abc123.applications = {
      calico: modelDataApplicationFactory.build({
        status: modelDataStatusFactory.build({
          info: "app blocked",
          status: "blocked",
        }),
      }),
      etcd: modelDataApplicationFactory.build({
        units: {
          "etcd/0": modelDataUnitFactory.build({
            "agent-status": modelDataStatusFactory.build({
              info: "unit blocked",
              status: "lost",
            }),
          }),
        },
      }),
    };
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <StatusGroup filters={{}} />
        </Provider>
      </MemoryRouter>
    );
    const tables = screen.getAllByRole("grid");
    const row = within(tables[0]).getAllByRole("row")[1];
    const error = within(row).getByRole("link", { name: "app blocked" });
    expect(error).toHaveAttribute("href", "/models/eggman@external/sub-test");
    await userEvent.hover(error);
    const tooltip = screen.getAllByRole("tooltip")[0];
    expect(error).toHaveAttribute("href", "/models/eggman@external/sub-test");
    const appError = within(tooltip).getByRole("link", {
      name: "app blocked",
    });
    expect(appError).toHaveAttribute(
      "href",
      "/models/eggman@external/sub-test/app/calico"
    );
    const unitError = within(tooltip).getByRole("link", {
      name: "unit blocked",
    });
    expect(unitError).toHaveAttribute(
      "href",
      "/models/eggman@external/sub-test/app/etcd/unit/etcd-0"
    );
  });
});
