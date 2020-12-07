import { mount } from "enzyme";

import Header from "./Header";

describe("Header", () => {
  it("renders supplied children", () => {
    const wrapper = mount(
      <Header>
        <div className="child"></div>
      </Header>
    );
    expect(wrapper.find(".child").length).toBe(1);
  });
});
