import {
  BrowserRouter as Router,
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import dataDump from "testing/complete-redux-store-dump";
import cloneDeep from "clone-deep";

import { TSFixMe } from "types";
import { UIState } from "store/ui/types";

import BaseLayout from "./BaseLayout";

const mockStore = configureStore([]);
describe("Base Layout", () => {
  it("renders with a sidebar", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <BaseLayout>
              <p>foo</p>
            </BaseLayout>
          </QueryParamProvider>
        </Router>
      </Provider>
    );
    expect(wrapper.find("[data-testid='main-children']").html()).toStrictEqual(
      `<div data-testid="main-children"><p>foo</p></div>`
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models/:userName/:modelName"
                element={
                  <BaseLayout>
                    <p>foo</p>
                  </BaseLayout>
                }
              />
            </Routes>
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
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models"
                element={
                  <BaseLayout>
                    <p>foo</p>
                  </BaseLayout>
                }
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find("header").prop("data-sidenav-initially-collapsed")
    ).toBe(false);
  });

  it("should include mobile navigation bar", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <Routes>
              <Route
                path="/models"
                element={
                  <BaseLayout>
                    <p>foo</p>
                  </BaseLayout>
                }
              />
            </Routes>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".l-navigation-bar").exists()).toBe(true);
  });
});
