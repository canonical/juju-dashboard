import { MemoryRouter } from "react-router";
import { render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { rootStateFactory } from "testing/factories";
import { generalStateFactory, configFactory } from "testing/factories/general";

import StatusGroup from "./StatusGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("StatusGroup", () => {
  it("by default, renders no tables when there is no data", () => {
    const store = mockStore(
      rootStateFactory.build({
        juju: {
          models: {},
          modelData: {},
        },
      })
    );
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
    const store = mockStore(dataDump);
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
    expect(within(tables[0]).getAllByRole("row")).toHaveLength(5);
    expect(within(tables[1]).getAllByRole("row")).toHaveLength(8);
    expect(within(tables[2]).getAllByRole("row")).toHaveLength(6);
  });

  it("fetches filtered data if filters supplied", () => {
    const store = mockStore(dataDump);
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
    expect(screen.getAllByRole("row").length).toBe(5);
  });

  it("displays the provider type icon", () => {
    const store = mockStore(dataDump);
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
    const store = mockStore(
      rootStateFactory.build({
        general: generalStateFactory.build({
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
        }),
        juju: dataDump.juju,
      })
    );
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
