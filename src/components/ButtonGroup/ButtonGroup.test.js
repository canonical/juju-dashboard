import React from "react";
import { mount } from "enzyme";
import { MemoryRouter } from "react-router-dom";

import ButtonGroup from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("shows active button", () => {
    const wrapper = mount(
      <MemoryRouter>
        <ButtonGroup
          buttons={["status", "cloud", "owner"]}
          activeButton="cloud"
        />
      </MemoryRouter>
    );
    expect(wrapper.find(".is-selected").length).toBe(1);
  });

  it("if no active button is defined then none is selected", () => {
    const wrapper = mount(
      <MemoryRouter>
        <ButtonGroup buttons={["status", "cloud", "owner"]} />
      </MemoryRouter>
    );
    expect(wrapper.find(".is-selected")).toEqual({});
  });

  it("calls to set active button on click", () => {
    const setActiveButton = jest.fn();
    const wrapper = mount(
      <MemoryRouter>
        <ButtonGroup
          buttons={["status", "cloud", "owner"]}
          activeButton="cloud"
          setActiveButton={setActiveButton}
        />
      </MemoryRouter>
    );
    expect(wrapper.find(".p-button-group__button.is-selected").text()).toBe(
      "cloud"
    );
    wrapper.find("button[value='owner']").simulate("click", {
      target: { value: "owner" },
    });
    expect(setActiveButton.mock.calls.length).toBe(1);
    expect(setActiveButton.mock.calls[0]).toEqual(["owner"]);
    // We don't check that the UI updated because it has no internal state.
    // It requires a parent to re-render it with a new selected group.
  });
});
