import React from "react";
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

  it("should show label correctly if only one model", () => {
    const fakeStatusList = {
      model: [
        { label: "foo", count: 1 },
        { label: "bar", count: 0 },
        { label: "baz", count: 0 },
      ],
    };
    const wrapper = mount(<StatusStrip statusList={fakeStatusList} />);
    const StatusStripHeading = wrapper.find(".status-strip strong");
    expect(StatusStripHeading.text()).toBe("1 model:");
  });

  it("should show label correctly if multiple models", () => {
    const fakeStatusList = {
      model: [
        { label: "foo", count: 1 },
        { label: "bar", count: 2 },
        { label: "baz", count: 3 },
      ],
    };
    const wrapper = mount(<StatusStrip statusList={fakeStatusList} />);
    const StatusStripHeading = wrapper.find(".status-strip strong");
    expect(StatusStripHeading.text()).toBe("6 models:");
  });
});
