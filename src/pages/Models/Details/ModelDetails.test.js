import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import TestRoute from "components/Routes/TestRoute";
import dataDump from "testing/complete-redux-store-dump";

import ModelDetails from "./ModelDetails";

jest.mock("components/Terminal/Terminal", () => {
  const Terminal = () => <div className="terminal"></div>;
  return Terminal;
});

const mockStore = configureStore([]);

describe("ModelDetail Container", () => {
  it("renders the details pane", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/group-test"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details")).toMatchSnapshot();
  });

  it("renders the details pane for models shared-with-me", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/space-man@external/frontend-ci"]}
        >
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details")).toMatchSnapshot();
  });

  it("renders the machine details section", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/spaceman@external/mymodel"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MainTable").at(2)).toMatchSnapshot();
  });

  it("renders the terminal", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/test1"]}>
          <TestRoute path="/models/*">
            <ModelDetails />
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Terminal")).toMatchSnapshot();
  });
});
