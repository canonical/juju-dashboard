import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { mount } from "enzyme";
import App from "./App";

import dataDump from "../../testing/complete-redux-store-dump";

const mockStore = configureStore([]);

describe("App", () => {
  it("properly sets up Router", () => {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(wrapper.find("BrowserRouter").prop("basename")).toBe("/");
  });
});
