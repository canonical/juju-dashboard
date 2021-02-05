import { mount } from "enzyme";

import ChipGroup from "./ChipGroup";

describe("Chip Group", () => {
  it("should show correct chip counts", () => {
    const fakeChips = [
      { label: "foo", count: 1 },
      { label: "bar", count: 2 },
      { label: "baz", count: 3 },
    ];
    const wrapper = mount(<ChipGroup chips={fakeChips} />);
    expect(wrapper.find(".is-foo").text()).toBe("1 foo");
    expect(wrapper.find(".is-bar").text()).toBe("2 bar");
    expect(wrapper.find(".is-baz").text()).toBe("3 baz");
  });

  it("should not show chips with zero count", () => {
    const fakeChips = [
      { label: "foo", count: 1 },
      { label: "bar", count: 2 },
      { label: "baz", count: 0 },
    ];
    const wrapper = mount(<ChipGroup chips={fakeChips} />);
    expect(wrapper.find(".is-baz").length).toBe(0);
  });
});
