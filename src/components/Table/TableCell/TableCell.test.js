import { shallow } from "enzyme";
import React from "react";

import TableCell from "./TableCell";

describe("TableCell", () => {
  it("renders", () => {
    const wrapper = shallow(<TableCell>Test content</TableCell>);
    expect(wrapper).toMatchSnapshot();
  });

  it("can set a role", () => {
    const wrapper = shallow(<TableCell role="rowheader" />);
    expect(wrapper.prop("role")).toStrictEqual("rowheader");
  });

  it("can be hidden", () => {
    const wrapper = shallow(<TableCell hidden />);
    expect(wrapper.prop("aria-hidden")).toBe(true);
  });

  it("can add be expanding", () => {
    const wrapper = shallow(<TableCell expanding />);
    expect(wrapper.prop("className")).toContain(
      "p-table-expanding__panel"
    );
  });

  it("can add additional classes", () => {
    const wrapper = shallow(
      <TableCell expanding className="extra-class" />
    );
    const className = wrapper.prop("className");
    expect(className).toContain("p-table-expanding__panel");
    expect(className).toContain("extra-class");
  });
});
