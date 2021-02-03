import { mount } from "enzyme";

import StatusStrip from "./StatusStrip";

describe("Status Strip", () => {
  it("should show correct status counts", () => {
    const fakeStatusList = {
      model: [
        { label: "foo", count: 1 },
        { label: "bar", count: 2 },
        { label: "baz", count: 3 },
      ],
    };
    const wrapper = mount(<StatusStrip statusList={fakeStatusList} />);
    expect(wrapper.find(".is-foo").text()).toBe("1 foo");
    expect(wrapper.find(".is-bar").text()).toBe("2 bar");
    expect(wrapper.find(".is-baz").text()).toBe("3 baz");
  });
});
