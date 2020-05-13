import React from "react";
import cloneDeep from "clone-deep";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Controllers from "./Controllers";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("Controllers table", () => {
  it("renders a blank page if no data", () => {
    const store = mockStore({
      juju: {},
      root: {
        config: {},
      },
    });
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(0);
  });

  it("renders the correct number of rows", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").length).toBe(6);
  });

  it("counts models, machines, apps, and units", () => {
    const clonedData = cloneDeep(dataDump);
    // override existing data mock while using as much real content as possible.
    const existingUUID = "086f0bf8-da79-4ad4-8d73-890721332c8b";
    clonedData.juju.modelData[
      "e1e81a64-3385-4779-8643-05e3d5ed4523"
    ].info.controllerUuid = existingUUID;
    const store = mockStore(clonedData);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("tbody tr").get(0)).toMatchSnapshot();
  });

  it("renders a warning if you do not have access", () => {
    dataDump.root.controllerConnection.info.user.controllerAccess = "";
    const store = mockStore(dataDump);
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <Controllers />
        </Provider>
      </MemoryRouter>
    );
    expect(
      wrapper.find('Notification[type="caution"]').text()
    ).toMatchSnapshot();
  });
});
