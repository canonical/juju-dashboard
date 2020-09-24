import React from "react";
import { shallow } from "enzyme";

import Banner from "./Banner";

describe("Banner", () => {
  it("should display banner text", () => {
    const wrapper = shallow(
      <Banner>
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
    const wrapper = shallow(<Banner isActive={false} />);
    expect(wrapper.find("div").prop("data-active")).toStrictEqual(false);
  });

  it("should as cautionary if type prop is set", () => {
    const wrapper = shallow(<Banner type="caution" />);
    expect(wrapper.find("div").prop("data-type")).toStrictEqual("caution");
  });
});
