import { mount } from "enzyme";

import ToastCard from "./ToastCard";

describe("Toast Card", () => {
  it("should display message", () => {
    const wrapper = mount(
      <ToastCard type="positive" message="I am a toast message" />
    );
    expect(wrapper.find(".toast-card").text()).toStrictEqual(
      "I am a toast message"
    );
  });

  it("should display as correct type", () => {
    const wrapper = mount(
      <ToastCard type="positive" message="I am a toast message" />
    );
    expect(wrapper.find("[data-type='positive']").exists()).toBe(true);
  });
});
