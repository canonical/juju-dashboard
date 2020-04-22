import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";
import Layout from "./Layout";

const mockStore = configureStore([]);
describe("Layout", () => {
  it("renders with a sidebar", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Layout />
        </Router>
      </Provider>
    );
    expect(wrapper.find(".l-side")).toHaveLength(1);
  });

  it("should display the children", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <Layout>content</Layout>
        </Router>
      </Provider>
    );
    expect(wrapper.find("[data-test='main-children']").html()).toStrictEqual(
      `<div data-test="main-children">content</div>`
    );
  });
});
