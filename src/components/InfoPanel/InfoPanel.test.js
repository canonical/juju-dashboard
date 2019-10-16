import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Route } from "react-router-dom";
import dataDump from "testing/complete-redux-store-dump";

import InfoPanel from "./InfoPanel";

const mockStore = configureStore([]);

describe("Info Panel", () => {
  it("renders without crashing and matches snapshot", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <Route path="/models/*">
            <InfoPanel />
          </Route>
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
          <Route path="/models/*">
            <InfoPanel />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-name="name"]').text()).toStrictEqual(
      "group-test"
    );
  });
});
