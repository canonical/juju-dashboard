import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";

import LogIn from "./LogIn";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("LogIn", () => {
  it("renders a 'connecting' message while connecting", () => {
    const store = mockStore({
      root: {
        config: {
          identityProviderAvailable: true,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    // The `trim()` is required here because the Spinner component uses an
    // &ensp; for a space and jsdom appears to get confused.
    expect(wrapper.find(".p-button--neutral").text().trim()).toBe(
      "Connecting..."
    );
    expect(wrapper.find("LogIn main").text()).toBe("App content");
  });

  it("renders an IdentityProvider login UI if the user is not logged in", () => {
    const store = mockStore({
      root: {
        visitURL: "I am a url",
        config: dataDump.root.config,
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(wrapper.find(".p-button--positive").text()).toBe(
      "Log in to the dashboard"
    );
    expect(wrapper.find("LogIn main").text()).toBe("App content");
  });

  it("renders a UserPass login UI if the user is not logged in", () => {
    const store = mockStore({
      root: {
        config: {
          identityProviderAvailable: false,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(wrapper.find(".p-button--positive").text()).toBe(
      "Log in to the dashboard"
    );
    expect(wrapper.find("LogIn main").text()).toBe("App content");
  });

  it("renders a login error if one exists", () => {
    const store = mockStore({
      root: {
        loginError: "Invalid user name",
        config: {
          identityProviderAvailable: false,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <LogIn>App content</LogIn>
      </Provider>
    );
    expect(wrapper.find("LogIn .error-message").text()).toBe(
      "Invalid user name"
    );
  });
});
