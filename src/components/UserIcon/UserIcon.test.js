import React from "react";
import { shallow } from "enzyme";

import UserIcon from "./UserIcon";

describe("User Icon", () => {
  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<UserIcon />);
    expect(wrapper).toMatchSnapshot();
  });

  it("toggles drop-down panel", () => {
    const wrapper = shallow(<UserIcon />);

    const userIconPanel = ".user-icon__panel";
    const userIconPanelToggle = ".p-icon--user";

    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(false);
    wrapper.find(userIconPanelToggle).simulate("click");
    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(true);
    wrapper.find(userIconPanelToggle).simulate("click");
    expect(wrapper.find(userIconPanel).hasClass("is-visible")).toEqual(false);
  });
});
