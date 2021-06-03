import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import { QueryParamProvider } from "use-query-params";
import TestRoute from "components/Routes/TestRoute";
import dataDump from "testing/complete-redux-store-dump";
import cloneDeep from "clone-deep";

import { TSFixMe, UIState } from "types";

import BaseLayout from "./BaseLayout";

const mockStore = configureStore([]);
describe("Base Layout", () => {
  it("renders with a sidebar", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <BaseLayout>
              <p>foo</p>
            </BaseLayout>
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    expect(wrapper.find(".l-navigation")).toHaveLength(1);
  });

  it("should display the children", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <BaseLayout>
              <p>foo</p>
            </BaseLayout>
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    expect(wrapper.find("[data-test='main-children']").html()).toStrictEqual(
      `<div data-test="main-children"><p>foo</p></div>`
    );
  });

  it("should collapse the sidebar on entity details pages", () => {
    const clonedDump: TSFixMe = cloneDeep(dataDump);
    const ui: UIState = clonedDump.ui;
    ui.sideNavCollapsed = true;
    const store = mockStore(clonedDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/:userName/:modelName?">
              <BaseLayout>
                <p>foo</p>
              </BaseLayout>
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find("header").prop("data-sidenav-initially-collapsed")
    ).toBe(true);
  });

  it("should not collapse the sidebar when not on entity details pages", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models">
              <BaseLayout>
                <p>foo</p>
              </BaseLayout>
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find("header").prop("data-sidenav-initially-collapsed")
    ).toBe(false);
  });
});
