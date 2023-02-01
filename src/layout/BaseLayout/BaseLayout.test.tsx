import { render, screen, within } from "@testing-library/react";
import {
  BrowserRouter as Router,
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { rootStateFactory } from "testing/factories/root";
import { RootState } from "store/store";

import BaseLayout from "./BaseLayout";

const mockStore = configureStore([]);
describe("Base Layout", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build();
  });

  it("renders with a sidebar", () => {
    const store = mockStore(state);
    render(
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
    expect(document.querySelector(".l-navigation")).toBeInTheDocument();
  });

  it("should display the children", () => {
    const store = mockStore(state);
    render(
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
    const main = screen.getByTestId("main-children");
    expect(within(main).getByText("foo")).toBeInTheDocument();
  });

  it("should collapse the sidebar on entity details pages", () => {
    state.ui.sideNavCollapsed = true;
    const store = mockStore(state);
    render(
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
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-sidenav-initially-collapsed",
      "true"
    );
  });

  it("should not collapse the sidebar when not on entity details pages", () => {
    const store = mockStore(state);
    render(
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
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-sidenav-initially-collapsed",
      "false"
    );
  });

  it("should include mobile navigation bar", () => {
    const store = mockStore(state);
    render(
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
    expect(document.querySelector(".l-navigation-bar")).toBeInTheDocument();
  });
});
