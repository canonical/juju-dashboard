import React from "react";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router-dom";

import ModelGroupToggle from "./ModelGroupToggle";

describe("Model group toggle", () => {
  it("shows active grouping", () => {
    const wrapper = mount(
      <MemoryRouter>
        <ModelGroupToggle groupedBy="cloud" />
      </MemoryRouter>
    );
    expect(wrapper.find(".is-selected").length).toBe(1);
  });

  it("if no grouping is defined then none is selected", () => {
    const wrapper = mount(
      <MemoryRouter>
        <ModelGroupToggle />
      </MemoryRouter>
    );
    expect(wrapper.find(".is-selected")).toEqual({});
  });

  it("calls to set group by on click", () => {
    const setGroupedBy = jest.fn();
    const wrapper = mount(
      <MemoryRouter>
        <ModelGroupToggle groupedBy="cloud" setGroupedBy={setGroupedBy} />
      </MemoryRouter>
    );
    expect(
      wrapper.find(".p-model-group-toggle__button.is-selected").text()
    ).toBe("cloud");
    wrapper.find("button[value='owner']").simulate("click", {
      target: { value: "owner" }
    });
    expect(setGroupedBy.mock.calls.length).toBe(1);
    expect(setGroupedBy.mock.calls[0]).toEqual(["owner"]);
    // We don't check that the UI updated because it has no internal state.
    // It requires a parent to re-render it with a new selected group.
  });
});
