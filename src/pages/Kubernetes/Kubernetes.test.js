import React from "react";
import { shallow } from "enzyme";
import Kubernetes from "./Kubernetes";

describe("Kubernetes page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Kubernetes />);
    expect(wrapper).toMatchSnapshot();
  });
});
