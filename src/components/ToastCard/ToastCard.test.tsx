import { mount } from "enzyme";
import cloneDeep from "clone-deep";

import ToastCard from "./ToastCard";

describe("Toast Card", () => {
  const toastInstanceExample = {
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
    const t = cloneDeep(toastInstanceExample);
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
    const t = cloneDeep(toastInstanceExample);
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
    const t = cloneDeep(toastInstanceExample);
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
    const t = cloneDeep(toastInstanceExample);
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
    const t = cloneDeep(toastInstanceExample);
    const wrapper = mount(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".p-icon--close").exists()).toBe(true);
  });

  it("should not display an undo button if an undo function is not passed", () => {
    const t = cloneDeep(toastInstanceExample);
    const wrapper = mount(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
      />
    );
    expect(wrapper.find(".toast-card__undo").exists()).toBe(false);
  });

  it("should display a clickable undo button if an undo function is passed", () => {
    const undoFn = jest.fn();
    const t = cloneDeep(toastInstanceExample);
    const wrapper = mount(
      <ToastCard
        type="negative"
        text="I am a toast message"
        toastInstance={t}
        undo={undoFn}
      />
    );
    const undoButton = wrapper.find(".toast-card__undo button");
    expect(undoButton.exists()).toBe(true);
    undoButton.simulate("click");
    expect(undoFn).toBeCalled();
  });
});
