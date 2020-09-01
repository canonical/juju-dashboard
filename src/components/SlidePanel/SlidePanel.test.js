import React from "react";
import { shallow, mount } from "enzyme";

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
});

  it("should call close function when Escape key is pressed", () => {
    const outerNode = document.createElement("div");
    document.body.appendChild(outerNode);
    const onClose = jest.fn();

    const wrapper = mount(<SlidePanel isActive={true} onClose={onClose} />, {
      attachTo: outerNode,
    });
    const slidePanelContent = wrapper.find(`.slide-panel__content`);

    outerNode.dispatchEvent(new Event("keydown", {'code': "Escape"}));
    expect(onClose).toHaveBeenCalled();
  });
});
