import { mount } from "enzyme";

import ToastCard from "./ToastCard";

describe("Toast Card", () => {
  const t = {
    createdAt: 1623162274616,
    duration: 5000,
    id: "2",
    message: "message",
    pauseDuration: 0,
    style: {},
    type: "custom",
    visible: true,
  };

  it("should display message", () => {
    const wrapper = mount(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".toast-card__message").text()).toStrictEqual(
      "I am a toast message"
    );
  });

  it("should display as correct type", () => {
    const wrapper = mount(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find("[data-type='positive']").exists()).toBe(true);
  });

  it("should display correct success icon", () => {
    const wrapper = mount(
      <ToastCard
        type="positive"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".p-icon--success").exists()).toBe(true);
  });

  it("should display correct error icon", () => {
    const wrapper = mount(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".p-icon--error").exists()).toBe(true);
  });

  it("should display close icon", () => {
    const wrapper = mount(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".p-icon--close").exists()).toBe(true);
  });
});
