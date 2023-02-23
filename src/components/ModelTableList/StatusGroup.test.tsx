import { MemoryRouter } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelStatusInfoFactory,
  modelDataApplicationFactory,
  modelDataStatusFactory,
  modelUserInfoFactory,
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
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
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
      }),
    });
  });

  it("by default, renders no tables when there is no data", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <StatusGroup filters={[]} />
          </QueryParamProvider>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <StatusGroup filters={[]} />
          </QueryParamProvider>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <StatusGroup filters={filters} />
          </QueryParamProvider>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <StatusGroup filters={[]} />
          </QueryParamProvider>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <StatusGroup filters={filters} />
          </QueryParamProvider>
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
});
