import React from "react";
import { shallow } from "enzyme";

import SlidePanel from "./SlidePanel";

describe("Slide Panel", () => {
  it("should display content", () => {
    const wrapper = shallow(
      <SlidePanel>
        <p>Slide panel content</p>
      </SlidePanel>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Slide panel content");
  });

  it("should display when active", () => {
    const wrapper = shallow(<SlidePanel isActive={true} />);
    expect(wrapper.find(".slide-panel").prop("aria-hidden")).toBe(false);
  });

  it("should hide when inactive", () => {
    const wrapper = shallow(<SlidePanel isActive={false} />);
    expect(wrapper.find(".slide-panel").prop("aria-hidden")).toBe(true);
  });

  it("should call close function when close button is clicked", () => {
    const onClose = jest.fn();
    const wrapper = shallow(<SlidePanel isActive={true} onClose={onClose} />);
    wrapper.find(".p-modal__close").simulate("click");
    expect(onClose).toHaveBeenCalled();
  });
});
