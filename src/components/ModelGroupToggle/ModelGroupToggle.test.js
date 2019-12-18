import React from "react";
import { shallow } from "enzyme";

import ModelGroupToggle from "./ModelGroupToggle";

describe("Model group toggle", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<ModelGroupToggle />);
    expect(wrapper.find(".p-model-group-toggle")).toMatchSnapshot();
  });

  it("shows active grouping", () => {
    const wrapper = shallow(<ModelGroupToggle groupedBy="cloud" />);
    expect(wrapper.find(".p-model-group-toggle")).toMatchSnapshot();
  });

  it("calls to set group by on click", () => {
    const setGroupedBy = jest.fn();
    const wrapper = shallow(
      <ModelGroupToggle groupedBy="cloud" setGroupedBy={setGroupedBy} />
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
