import React from "react";
import { shallow } from "enzyme";
import Logs from "./Logs";

describe("Logs page", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<Logs />);
    expect(wrapper).toMatchSnapshot();
  });
});
