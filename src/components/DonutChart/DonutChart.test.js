import React from "react";
import { mount } from "enzyme";

import DonutChart from "./DonutChart";

describe("Donut chart", () => {
  it("renders appropriate segments if data available", () => {
    const wrapper = mount(
      <DonutChart chartData={{ blocked: 1, alert: 1, running: 1 }} />
    );
    const svg = wrapper.find("svg").render();
    expect(svg.find(".is-blocked").length).toBe(1);
    expect(svg.find(".is-alert").length).toBe(1);
    expect(svg.find(".is-running").length).toBe(1);
  });

  it("renders as disabled if no data available", () => {
    const wrapper = mount(
      <DonutChart chartData={{ blocked: 0, alert: 0, running: 0 }} />
    );
    const svg = wrapper.find("svg").render();
    expect(svg.find(".is-disabled").length).toBe(1);
  });
});
