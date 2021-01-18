import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import cloneDeep from "clone-deep";
import dataDump from "testing/complete-redux-store-dump";

import UserMenu from "./UserMenu";

const mockStore = configureStore([]);
describe("User Menu", () => {
  it("is inactive by default", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    expect(wrapper.find(".user-menu").hasClass("is-active")).toEqual(false);
  });

  it("is active when userMenuActive in redux store is true", () => {
    const clonedDump = cloneDeep(dataDump);
    clonedDump.ui.userMenuActive = true;
    const store = mockStore(clonedDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );

    expect(wrapper.find(".user-menu").hasClass("is-active")).toEqual(true);
  });

  it("displays current logged in user", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    const username = ".user-menu__name";
    expect(wrapper.find(username).text()).toEqual("eggman");
  });

  it("Test dispatch function is fired", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <Router>
          <UserMenu />
        </Router>
      </Provider>
    );
    wrapper.find(".user-menu__header").simulate("click");
    const actions = store.getActions();
    const expectedPayload = { payload: true, type: "TOGGLE_USER_MENU" };
    expect(actions).toEqual([expectedPayload]);
  });
});
