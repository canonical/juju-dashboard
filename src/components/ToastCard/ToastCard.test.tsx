import { mount } from "enzyme";

import ToastCard from "./ToastCard";

describe("Toast Card", () => {
  it("should display message", () => {
    const wrapper = mount(
      <ToastCard type="positive" message="I am a toast message" />
    );
    expect(wrapper.find(".toast-card__message").text()).toStrictEqual(
      "I am a toast message"
    );
  });

  it("should display as correct type", () => {
    const wrapper = mount(
      <ToastCard type="positive" message="I am a toast message" />
    );
    expect(wrapper.find("[data-type='positive']").exists()).toBe(true);
  });

  it("should display correct success icon", () => {
    const wrapper = mount(
      <ToastCard type="positive" message="I am a toast message" />
    );
    expect(wrapper.find(".p-icon--success").exists()).toBe(true);
  });

  it("should display correct error icon", () => {
    const wrapper = mount(
      <ToastCard type="negative" message="I am a toast message" />
    );
    expect(wrapper.find(".p-icon--error").exists()).toBe(true);
  });
});
