import React from "react";
import { shallow } from "enzyme";
import App from "./App";

test("renders without crashing and matches snapshot", () => {
  const wrapper = shallow(<App />);
  expect(wrapper).toMatchSnapshot();
});
