import React from "react";
import { mount } from "enzyme";

import SlidePanel from "./SlidePanel";

describe("Slide Panel", () => {
  it("should display content", () => {
    const wrapper = mount(
      <SlidePanel isActive={true}>
        <p>Slide panel content</p>
      </SlidePanel>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Slide panel content");
  });

  it("should display when active", () => {
    const wrapper = mount(<SlidePanel isActive={true} />);
    expect(wrapper.find(".slide-panel").length).toBe(1);
  });

  it("should hide when inactive", () => {
    const wrapper = mount(<SlidePanel isActive={false} />);
    console.log(wrapper.debug());
    expect(wrapper.find(".slide-panel").length).toBe(0);
  });

  it("should call close function when close button is clicked", () => {
    const onClose = jest.fn();
    const wrapper = mount(<SlidePanel isActive={true} onClose={onClose} />);
    wrapper.find(".p-modal__close").simulate("click");
    expect(onClose).toHaveBeenCalled();
  });

  it("should call close function when click is captured outside component", () => {
    const outerNode = document.createElement("div");
    document.body.appendChild(outerNode);
    const onClose = jest.fn();

    const wrapper = mount(<SlidePanel isActive={true} onClose={onClose} />, {
      attachTo: outerNode,
    });
    const slidePanelContent = wrapper.find(`.slide-panel__content`);

    slidePanelContent
      .instance()
      .dispatchEvent(new Event("click", { bubbles: true }));
    expect(onClose).not.toHaveBeenCalled();

    outerNode.dispatchEvent(new Event("click", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it("should call close function when escape key is pressed", () => {
    const onClose = jest.fn();
    const outerNode = document.createElement("div");
    document.body.appendChild(outerNode);
    mount(<SlidePanel isActive={true} onClose={onClose} />, {
      attachTo: outerNode,
    });
    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Enter", bubbles: true })
    );
    expect(onClose).not.toHaveBeenCalled();
    outerNode.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Escape", bubbles: true })
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("accepts classnames and adds them to the wrapper", () => {
    const wrapper = mount(
      <SlidePanel isActive={true} className="test-class" />
    );
    expect(wrapper.find(".slide-panel").prop("className")).toBe(
      "slide-panel test-class"
    );
  });
});
