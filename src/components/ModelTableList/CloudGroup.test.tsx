import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import { render, screen, within } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import CloudGroup from "./CloudGroup";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("CloudGroup", () => {
  it("by default, renders no tables with no data", () => {
    const store = mockStore({
      root: {
        config: {
          controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
        },
      },
      juju: {
        models: {},
        modelData: {},
        modelInfo: {},
        modelStatuses: {},
      },
    });
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <CloudGroup filters={[]} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("displays model data grouped by cloud from the redux store", () => {
    const store = mockStore(dataDump);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <CloudGroup filters={[]} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = screen.getAllByRole("grid");
    expect(tables.length).toBe(2);
    expect(within(tables[0]).getAllByRole("row")).toHaveLength(14);
    expect(within(tables[1]).getAllByRole("row")).toHaveLength(4);
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
            <CloudGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const tables = screen.getAllByRole("grid");
    expect(tables.length).toBe(1);
    expect(within(tables[0]).getAllByRole("row")).toHaveLength(4);
  });

  it("model access buttons are present in cloud group", () => {
    const store = mockStore(dataDump);
    const filters = {
      cloud: ["aws"],
    };
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <CloudGroup filters={filters} />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const firstContentRow = screen.getAllByRole("row")[1];
    const modelAccessButton = within(firstContentRow).getAllByRole("button", {
      name: "Access",
    });
    expect(modelAccessButton.length).toBe(2);
    expect(within(firstContentRow).getAllByRole("gridcell")[8]).toHaveClass(
      "sm-screen-access-cell"
    );
    expect(within(firstContentRow).getAllByRole("gridcell")[7]).toHaveClass(
      "lrg-screen-access-cell"
    );
  });
});
