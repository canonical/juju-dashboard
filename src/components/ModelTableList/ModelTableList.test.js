import cloneDeep from "clone-deep";
import { MemoryRouter } from "react-router";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ModelTableList from "./ModelTableList";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("ModelTableList", () => {
  it("by default, renders the status table", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList />
        </Provider>
      </MemoryRouter>
    );
    const statusGroup = wrapper.find("StatusGroup");
    expect(statusGroup.length).toBe(1);
    expect(wrapper.find("OwnerGroup").length).toBe(0);
  });

  it("displays all data from redux store when grouping by...", () => {
    const store = mockStore(dataDump);
    const tables = [
      ["status", "StatusGroup"],
      ["owner", "OwnerGroup"],
      ["cloud", "CloudGroup"],
    ];
    tables.forEach((table) => {
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <ModelTableList groupedBy={table[0]} />
          </Provider>
        </MemoryRouter>
      );
      const Group = wrapper.find(table[1]);
      expect(Group.length).toBe(1);
      tables.forEach((otherTable) => {
        if (otherTable[0] !== table[0]) {
          expect(wrapper.find(otherTable[1]).length).toBe(0); // eslint-disable-line jest/no-conditional-expect
        }
      });
    });
  });

  it("passes the filters to the group components", () => {
    const store = mockStore(dataDump);
    const tables = [
      { groupedBy: "status", component: "StatusGroup" },
      { groupedBy: "status", component: "StatusGroup" },
      { groupedBy: "status", component: "StatusGroup" },
    ];
    const filters = ["cloud:aws"];
    tables.forEach((table) => {
      const wrapper = mount(
        <MemoryRouter>
          <Provider store={store}>
            <ModelTableList groupedBy={table.groupedBy} filters={filters} />
          </Provider>
        </MemoryRouter>
      );
      expect(wrapper.find(table.component).prop("filters")).toBe(filters);
    });
  });

  it("renders the controller name as JAAS", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList />
        </Provider>
      </MemoryRouter>
    );
    const controllerNames = wrapper.find('td[data-test-column="controller"]');
    expect(controllerNames.first().text()).toStrictEqual("JAAS");
  });

  it("renders the controller name as UUID if unknown", () => {
    const clonedData = cloneDeep(dataDump);
    // override existing data mock while using as much real content as possible.
    const unknownUUID = "unknown-6245-2134-1325-ee33ee55dd66";
    const testModelUUID = "19b56b55-6373-4286-8c19-957fakee8469";
    clonedData.juju.modelData[testModelUUID].info[
      "controller-uuid"
    ] = unknownUUID;
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList />
        </Provider>
      </MemoryRouter>
    );
    const controllerName = wrapper.find(
      `[data-test-model-uuid="${testModelUUID}"] td[data-test-column="controller"]`
    );
    expect(controllerName.text()).toStrictEqual(unknownUUID);
  });

  it("renders the controller name if known controller", () => {
    const clonedData = cloneDeep(dataDump);
    // override existing data mock while using as much real content as possible.
    const knownUUID = "086f0bf8-da79-4ad4-8d73-890721332c8b";
    const testModelUUID = "19b56b55-6373-4286-8c19-957fakee8469";
    clonedData.juju.modelData[testModelUUID].info[
      "controller-uuid"
    ] = knownUUID;
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ModelTableList />
        </Provider>
      </MemoryRouter>
    );
    const controllerNames = wrapper.find(
      `[data-test-model-uuid="${testModelUUID}"] td[data-test-column="controller"]`
    );
    expect(controllerNames.text()).toStrictEqual("admins/1-eu-west-1-aws-jaas");
  });
});
