import { shallow, mount } from "enzyme";

import Banner from "./Banner";

describe("Banner", () => {
  it("should display banner text", () => {
    const wrapper = shallow(
      <Banner variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Banner text");
  });

  it("should appear if active", () => {
    const wrapper = shallow(
      <Banner variant="positive" isActive={true}>
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find("div").prop("data-active")).toStrictEqual(true);
  });

  it("should not appear if not active", () => {
    const wrapper = shallow(
      <Banner variant="positive" isActive={false}>
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find("div").prop("data-active")).toStrictEqual(false);
  });

  it("should as cautionary if variant prop is set", () => {
    const wrapper = shallow(
      <Banner isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find("div").prop("data-variant")).toStrictEqual("caution");
  });

  it("should close if close button is pressed", () => {
    const wrapper = shallow(
      <Banner isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(true);
    wrapper.find(".banner__close").simulate("click");
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(false);
  });

  it("should return if variant changes after close button is pressed", () => {
    const wrapper = mount(
      <Banner isActive={true} variant="caution">
        <p>Banner text</p>
      </Banner>
    );
    wrapper.find(".banner__close").simulate("click");
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(false);
    wrapper.setProps({ variant: "positive", isActive: true });
    wrapper.update();
    expect(wrapper.find(".banner").prop("data-active")).toStrictEqual(true);
  });
});
