import { BrowserRouter as Router } from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import { QueryParamProvider } from "use-query-params";
import TestRoute from "components/Routes/TestRoute";
import dataDump from "testing/complete-redux-store-dump";
import Layout from "./Layout";

const mockStore = configureStore([]);
describe("Layout", () => {
  it("renders with a sidebar", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <QueryParamProvider ReactRouterRoute={Route}>
            <Layout />
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
            <Layout>content</Layout>
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    expect(wrapper.find("[data-test='main-children']").html()).toStrictEqual(
      `<div data-test="main-children">content</div>`
    );
  });

  it("should collapse the sidebar on model details pages", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/pizza@external/hadoopspark?activeView=machines",
          ]}
        >
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <Layout />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("header").prop("data-side-nav-collapsed")).toBe(true);
  });

  it("should not collapse the sidebar when not on model details pages", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/*">
              <Layout />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("header").prop("data-side-nav-collapsed")).toBe(false);
  });
});
