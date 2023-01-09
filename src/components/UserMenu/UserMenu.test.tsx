import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import cloneDeep from "clone-deep";
import dataDump from "testing/complete-redux-store-dump";

import UserMenu from "./UserMenu";

const mockStore = configureStore([]);
describe("User Menu", () => {
  it("is inactive by default", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    expect(document.querySelector(".user-menu")).not.toHaveClass("is-active");
  });

  it("is active when userMenuActive in redux store is true", () => {
    const clonedDump = cloneDeep(dataDump);
    clonedDump.ui.userMenuActive = true;
    const store = mockStore(clonedDump);
    render(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );

    expect(document.querySelector(".user-menu")).toHaveClass("is-active");
  });

  it("displays current logged in user", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    expect(screen.getByText("eggman")).toHaveClass("user-menu__name");
  });

  it("Test dispatch function is fired", async () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    await userEvent.click(screen.getByRole("button"));
    const actions = store.getActions();
    const expectedPayload = { payload: true, type: "ui/userMenuActive" };
    expect(actions).toEqual([expectedPayload]);
  });
});
