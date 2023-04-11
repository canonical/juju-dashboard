import { MemoryRouter } from "react-router";
import { render, RenderResult, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import * as appSelectors from "store/juju/selectors";
import { RootState } from "store/store";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";

import ModelTableList from "./ModelTableList";
import { TestId as CloudTestId } from "./CloudGroup";
import { TestId as OwnerTestId } from "./OwnerGroup";
import { TestId as StatusTestId } from "./StatusGroup";
import { JAAS_CONTROLLER_UUID } from "./shared";

const mockStore = configureStore([]);

describe("ModelTableList", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
          }),
        },
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("by default, renders the status table", () => {
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList filters={{}} groupedBy="" />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getByTestId(StatusTestId.STATUS_GROUP)).toBeInTheDocument();
    expect(
      screen.queryByTestId(OwnerTestId.OWNER_GROUP)
    ).not.toBeInTheDocument();
  });

  it("displays all data from redux store when grouping by...", () => {
    const store = mockStore(state);
    const tables = [
      ["status", StatusTestId.STATUS_GROUP],
      ["owner", OwnerTestId.OWNER_GROUP],
      ["cloud", CloudTestId.CLOUD_GROUP],
    ];
    const generateComponent = (groupedBy: string) => (
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList filters={{}} groupedBy={groupedBy} />
        </Provider>
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
    const store = mockStore(state);
    const tables = [
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
      { groupedBy: "status", component: StatusTestId.STATUS_GROUP },
    ];
    const filters = { cloud: ["aws"] };
    tables.forEach((table) => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <ModelTableList groupedBy={table.groupedBy} filters={filters} />
          </Provider>
        </MemoryRouter>
      );
      expect(getGroupedByStatusAndFilteredModelData).toHaveBeenCalledWith(
        filters
      );
    });
  });

  it("renders the controller name as JAAS", () => {
    state.juju.controllers = {
      "wss://jimm.jujucharms.com/api": [
        controllerFactory.build({
          path: "admins/1-eu-west-1-aws-jaas",
          uuid: JAAS_CONTROLLER_UUID,
        }),
      ],
    };
    const modelInfo = state.juju.modelData.abc123.info;
    if (modelInfo) {
      modelInfo["controller-uuid"] = JAAS_CONTROLLER_UUID;
    }
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList filters={{}} groupedBy="" />
        </Provider>
      </MemoryRouter>
    );
    expect(screen.getAllByTestId("column-controller")[0]).toHaveTextContent(
      "JAAS"
    );
  });

  it("renders the controller name as UUID if unknown", () => {
    const unknownUUID = "unknown-6245-2134-1325-ee33ee55dd66";
    const testModelUUID = "abc123";
    const modelInfo = state.juju.modelData[testModelUUID].info;
    if (modelInfo) {
      modelInfo["controller-uuid"] = unknownUUID;
    }
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList filters={{}} groupedBy="" />
        </Provider>
      </MemoryRouter>
    );
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      unknownUUID
    );
  });

  it("renders the controller name if known controller", () => {
    // override existing data mock while using as much real content as possible.
    const knownUUID = "086f0bf8-da79-4ad4-8d73-890721332c8b";
    const testModelUUID = "abc123";
    state.juju.controllers = {
      "wss://jimm.jujucharms.com/api": [
        controllerFactory.build({
          path: "admins/1-eu-west-1-aws-jaas",
          uuid: knownUUID,
        }),
      ],
    };
    const modelDataInfo = state.juju.modelData?.[testModelUUID].info;
    if (modelDataInfo) {
      modelDataInfo["controller-uuid"] = knownUUID;
    }
    const store = mockStore(state);
    render(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList filters={{}} groupedBy="" />
        </Provider>
      </MemoryRouter>
    );
    const row = screen.getByTestId(`model-uuid-${testModelUUID}`);
    expect(within(row).getByTestId("column-controller")).toHaveTextContent(
      "admins/1-eu-west-1-aws-jaas"
    );
  });
});
