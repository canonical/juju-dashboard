import cloneDeep from "clone-deep";
import { MemoryRouter } from "react-router";
import { render, RenderResult, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import * as appSelectors from "store/juju/selectors";
import ModelTableList from "./ModelTableList";

import dataDump from "../../testing/complete-redux-store-dump";
import { TestId as CloudTestId } from "./CloudGroup";
import { TestId as OwnerTestId } from "./OwnerGroup";
import { TestId as StatusTestId } from "./StatusGroup";

const mockStore = configureStore([]);

describe("ModelTableList", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("by default, renders the status table", () => {
    const store = mockStore(dataDump);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelTableList filters={[]} groupedBy="" />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByTestId(StatusTestId.STATUS_GROUP)).toBeInTheDocument();
    expect(
      screen.queryByTestId(OwnerTestId.OWNER_GROUP)
    ).not.toBeInTheDocument();
  });

  it("displays all data from redux store when grouping by...", () => {
    const store = mockStore(dataDump);
    const tables = [
      ["status", StatusTestId.STATUS_GROUP],
      ["owner", OwnerTestId.OWNER_GROUP],
      ["cloud", CloudTestId.CLOUD_GROUP],
    ];
    const generateComponent = (groupedBy: string) => (
      <MemoryRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Provider store={store}>
            <ModelTableList filters={[]} groupedBy={groupedBy} />
          </Provider>
        </QueryParamProvider>
      </MemoryRouter>
    );
    let result: RenderResult;
    tables.forEach((table) => {
      if (result) {
        result.rerender(generateComponent(table[0]));
      } else {
        result = render(generateComponent(table[0]));
      }
      expect(screen.getByTestId(table[1])).toBeInTheDocument();
      tables.forEach((otherTable) => {
        if (otherTable[0] !== table[0]) {
          expect(screen.queryByTestId(otherTable[1])).not.toBeInTheDocument(); // eslint-disable-line jest/no-conditional-expect
        }
      });
    });
  });

  it("passes the filters to the group components", () => {
    const getGroupedByStatusAndFilteredModelData = jest.spyOn(
      appSelectors,
      "getGroupedByStatusAndFilteredModelData"
    );
    const store = mockStore(dataDump);
    const tables = [
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
    ];
    const filters = ["cloud:aws"];
    tables.forEach((table) => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
              <ModelTableList groupedBy={table.groupedBy} filters={filters} />
            </QueryParamProvider>
          </Provider>
        </MemoryRouter>
      );
      expect(getGroupedByStatusAndFilteredModelData).toHaveBeenCalledWith(
        filters
      );
    });
  });

  it("renders the controller name as JAAS", () => {
    const store = mockStore(dataDump);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelTableList filters={[]} groupedBy="" />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("column-controller")[0]).toHaveTextContent(
      "JAAS"
    );
  });

  it("renders the controller name as UUID if unknown", () => {
    const clonedData = cloneDeep(dataDump);
    // override existing data mock while using as much real content as possible.
    const unknownUUID = "unknown-6245-2134-1325-ee33ee55dd66";
    const testModelUUID = "19b56b55-6373-4286-8c19-957fakee8469";
    clonedData.juju.modelData[testModelUUID].info["controller-uuid"] =
      unknownUUID;
    const store = mockStore(clonedData);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelTableList filters={[]} groupedBy="" />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      unknownUUID
    );
  });

  it("renders the controller name if known controller", () => {
    const clonedData = cloneDeep(dataDump);
    // override existing data mock while using as much real content as possible.
    const knownUUID = "086f0bf8-da79-4ad4-8d73-890721332c8b";
    const testModelUUID = "19b56b55-6373-4286-8c19-957fakee8469";
    clonedData.juju.modelData[testModelUUID].info["controller-uuid"] =
      knownUUID;
    const store = mockStore(clonedData);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ModelTableList filters={[]} groupedBy="" />
          </QueryParamProvider>
        </Provider>
      </MemoryRouter>
    );
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      "admins/1-eu-west-1-aws-jaas"
    );
  });
});
