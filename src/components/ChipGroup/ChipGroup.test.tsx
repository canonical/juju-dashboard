import { mount } from "enzyme";

import ChipGroup from "./ChipGroup";

describe("Chip Group", () => {
  it("should show correct chip counts", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 3,
    };
    const wrapper = mount(<ChipGroup chips={fakeChips} />);
    expect(wrapper.find(".is-foo").text()).toBe("1 foo");
    expect(wrapper.find(".is-bar").text()).toBe("2 bar");
    expect(wrapper.find(".is-baz").text()).toBe("3 baz");
  });

  it("should not show chips with zero count", () => {
    const fakeChips = {
      foo: 1,
      bar: 2,
      baz: 0,
    };
    const wrapper = mount(<ChipGroup chips={fakeChips} />);
    expect(wrapper.find(".is-baz").length).toBe(0);
  });
});
