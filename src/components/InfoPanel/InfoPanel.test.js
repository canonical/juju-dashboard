import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import TestRoute from "components/Routes/TestRoute";

import InfoPanel from "./InfoPanel";

const mockStore = configureStore([]);

describe("Info Panel", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <InfoPanel />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".info-panel")).toMatchSnapshot();
  });

  it("displays correct model status info", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <InfoPanel />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-name="controller"]').text()).toStrictEqual(
      "iaas"
    );
  });
});
