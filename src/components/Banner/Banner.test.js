import React from "react";
import { shallow, mount } from "enzyme";

import Banner from "./Banner";

describe("Banner", () => {
  it("should display banner text", () => {
    const wrapper = shallow(
      <Banner isActive={true}>
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Banner text");
  });

  it("should appear if active", () => {
    const wrapper = shallow(<Banner isActive={true} />);
    expect(wrapper.find("div").prop("data-active")).toStrictEqual(true);
  });

  it("should not appear if not active", () => {
    const wrapper = shallow(<Banner />);
    expect(wrapper.find("div").prop("data-active")).toStrictEqual(false);
  });

  it("should as cautionary if type prop is set", () => {
    const wrapper = shallow(<Banner isActive={true} type="caution" />);
    expect(wrapper.find("div").prop("data-type")).toStrictEqual("caution");
  });

  it("should close if close button is pressed", () => {
    const wrapper = shallow(<Banner isActive={true} type="caution" />);
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(true);
    wrapper.find(".banner__close").simulate("click");
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(false);
  });

  it("should return if type changes after close button is pressed", () => {
    const wrapper = mount(<Banner isActive={true} type="caution" />);
    wrapper.find(".banner__close").simulate("click");
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(false);
    wrapper.setProps({ type: "positive", isActive: true });
    wrapper.update();
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(true);
  });
});
