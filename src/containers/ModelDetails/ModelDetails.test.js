import React from "react";
import { shallow } from "enzyme";

import ModelDetail from "./ModelDetails";

describe("ModelDetail Container", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<ModelDetail />);
    expect(wrapper).toMatchSnapshot();
  });
});
