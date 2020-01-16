import React from "react";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ControllerChart from "./ControllerChart";

const mockStore = configureStore([]);

describe("Controllers chart", () => {
  it("renders if totals correctly", () => {
    const store = mockStore({
      juju: {}
    });
    const chartData = {};
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ControllerChart
            chartData={chartData}
            totalCount={30}
            totalLabel="machine"
          />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("[data-test='total-count']").text()).toBe(
      "30 machines"
    );
  });
  it("renders the correct counts by status", () => {
    const store = mockStore({
      juju: {}
    });
    const chartData = { blocked: 5, alert: 10, running: 15 };
    const wrapper = mount(
      <MemoryRouter>
        <Provider store={store}>
          <ControllerChart
            chartData={chartData}
            totalCount={30}
            totalLabel="machine"
          />
        </Provider>
      </MemoryRouter>
    );
    expect(wrapper.find("[data-test='legend-blocked']").text()).toBe(
      "Blocked: 5"
    );
    expect(wrapper.find("[data-test='legend-alert']").text()).toBe(
      "Alerts: 10"
    );
    expect(wrapper.find("[data-test='legend-running']").text()).toBe(
      "Running: 15"
    );
  });
});
