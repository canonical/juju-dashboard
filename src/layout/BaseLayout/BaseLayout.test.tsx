import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  MemoryRouter,
  Route,
  Routes,
} from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories/root";

import BaseLayout, { Label } from "./BaseLayout";

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
          <BaseLayout>
            <p>foo</p>
          </BaseLayout>
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
          <BaseLayout>
            <p>foo</p>
          </BaseLayout>
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
        </MemoryRouter>
      </Provider>
    );
    expect(document.querySelector(".l-navigation-bar")).toBeInTheDocument();
  });

  it("can toggle the mobile navigation bar", async () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
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
        </MemoryRouter>
      </Provider>
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "true"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.MOBILE_MENU_OPEN_BUTTON })
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "false"
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.MOBILE_MENU_CLOSE_BUTTON })
    );
    expect(document.querySelector(".l-navigation")).toHaveAttribute(
      "data-collapsed",
      "true"
    );
  });

  it("displays a message if the dashboard is offline", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
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
        </MemoryRouter>
      </Provider>
    );
    fireEvent.offline(window);
    expect(screen.getByText(Label.OFFLINE)).toBeInTheDocument();
  });

  it("displays a message if the dashboard comes back on line", () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/"]}>
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
        </MemoryRouter>
      </Provider>
    );
    fireEvent.online(window);
    expect(
      screen.getByText(/Your dashboard is now back online/)
    ).toBeInTheDocument();
  });
});
