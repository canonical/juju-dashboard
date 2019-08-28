import React from "react";
import { shallow } from "enzyme";

import InfoPanel from "./InfoPanel";

describe("InfoPanel", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<InfoPanel />);
    expect(wrapper).toMatchSnapshot();
  });
});
