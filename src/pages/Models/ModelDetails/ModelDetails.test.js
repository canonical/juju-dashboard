import { Provider } from "react-redux";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import React from "react";

import dataDump from "testing/complete-redux-store-dump";

import ModelDetail from "./ModelDetails";

const mockStore = configureStore([]);

describe("ModelDetail Container", () => {
  it("renders with a login message when not logged in", () => {
    const store = mockStore({
      root: {},
      juju: dataDump.juju
    });
    const wrapper = mount(
      <Provider store={store}>
        <ModelDetail />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("renders the details pane when the user is logged in", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <ModelDetail />
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
