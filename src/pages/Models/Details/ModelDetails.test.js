import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import dataDump from "testing/complete-redux-store-dump";

import ModelDetail from "./ModelDetails";

jest.mock("components/Terminal/Terminal", () => () => "Terminal");

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
    expect(wrapper.find("div")).toMatchSnapshot();
  });

  describe("When the user is logged in...", () => {
    it("renders the details pane", () => {
      const store = mockStore(dataDump);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <ModelDetail />
          </MemoryRouter>
        </Provider>
      );
      expect(wrapper.find(".model-details")).toMatchSnapshot();
    });
  });
});
