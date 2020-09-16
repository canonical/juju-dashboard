import React from "react";
import { mount } from "enzyme";

import Counts from "./Counts";

describe("Counts", () => {
  it("shows the primaryEntity content without any secondaryEntities provided", () => {
    const wrapper = mount(
      <Counts primaryEntity={{ count: 1, label: "application" }} />
    );
    expect(wrapper.find(".entity-counts").text()).toBe("1 application: ");
  });

  it("shows the secondaryEntities content if provided", () => {
    const wrapper = mount(
      <Counts
        primaryEntity={{ count: 1, label: "application" }}
        secondaryEntities={[
          { count: 1, label: "machine" },
          { count: 2, label: "running" },
        ]}
      />
    );
    expect(wrapper.find(".entity-counts").text()).toBe(
      "1 application: 1 machine, 2 running"
    );
  });

  it("pluralizes multiple values on primaryEntity and secondaryEntities", () => {
    const wrapper = mount(
      <Counts
        primaryEntity={{ count: 3, label: "application" }}
        secondaryEntities={[
          { count: 7, label: "machine" },
          { count: 2, label: "running" },
        ]}
      />
    );
    expect(wrapper.find(".entity-counts").text()).toBe(
      "3 applications: 7 machines, 2 running"
    );
  });
});
