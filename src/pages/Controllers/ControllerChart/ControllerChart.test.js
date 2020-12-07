import { mount } from "enzyme";

import ControllerChart from "./ControllerChart";

describe("Controllers chart", () => {
  it("supports empty data", () => {
    const chartData = {};
    const wrapper = mount(
      <ControllerChart chartData={chartData} totalLabel="machine" />
    );
    expect(wrapper.find("[data-test='total-count']").text()).toBe("0 machines");
  });

  it("renders the correct counts by status", () => {
    const chartData = { blocked: 5, alert: 10, running: 15 };
    const wrapper = mount(
      <ControllerChart chartData={chartData} totalLabel="machine" />
    );
    expect(wrapper.find("[data-test='legend-blocked']").text()).toBe(
      "Blocked: 6%, 5"
    );
    expect(wrapper.find("[data-test='legend-alert']").text()).toBe(
      "Alerts: 3%, 10"
    );
    expect(wrapper.find("[data-test='legend-running']").text()).toBe(
      "Running: 2%, 15"
    );
  });
});
