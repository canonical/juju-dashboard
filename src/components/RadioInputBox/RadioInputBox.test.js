import { mount } from "enzyme";

import { waitForComponentToPaint } from "testing/utils";

import RadioInputBox from "./RadioInputBox";

describe("RadioInputBox", () => {
  it("opens to reveal a description and children on select", async () => {
    const child = <div>I am a child, wahhh</div>;
    const onSelect = jest.fn();
    const wrapper = mount(
      <RadioInputBox
        name="Action"
        description="I am the description"
        onSelect={onSelect}
      >
        {child}
      </RadioInputBox>
    );
    expect(wrapper.find(".radio-input-box[aria-expanded=true]").exists()).toBe(
      false
    );
    wrapper.find('input[type="radio"]').simulate("click", {});
    await waitForComponentToPaint(wrapper);
    expect(onSelect.mock.calls.length).toBe(1);
    expect(onSelect.mock.calls[0]).toEqual(["Action"]);
    await waitForComponentToPaint(wrapper);
    expect(wrapper.find(".radio-input-box[aria-expanded=true]").exists()).toBe(
      true
    );
  });

  it("opens if the selectedInput matches the name", async () => {
    const child = <div>I am a child, wahhh</div>;
    const onSelect = jest.fn();
    const wrapper = mount(
      <RadioInputBox
        name="Action"
        description="I am the description"
        selectedInput="Action"
        onSelect={onSelect}
      >
        {child}
      </RadioInputBox>
    );
    await waitForComponentToPaint(wrapper);
    expect(wrapper.find(".radio-input-box[aria-expanded=true]").exists()).toBe(
      true
    );
    wrapper.find('input[type="radio"]').simulate("click", {});
  });
});
