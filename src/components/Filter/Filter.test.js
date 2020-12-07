import { mount } from "enzyme";

import Filter from "./Filter";

describe("Filter", () => {
  const filters = ["foo", "bar", "baz", "foobar"];

  it("displays correct number of filters", () => {
    const wrapper = mount(<Filter label="Filter:" filters={filters} />);
    expect(wrapper.find(".p-button--filter")).toHaveLength(4);
  });
});
