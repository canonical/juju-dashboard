import React from "react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Route } from "react-router-dom";
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
        <MemoryRouter>
          <ModelDetails />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".model-details")).toMatchSnapshot();
  });

  it("renders the terminal", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/test1"]}>
          <Route path="/models/*">
            <ModelDetails />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Terminal")).toMatchSnapshot();
  });
});
