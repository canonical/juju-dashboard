import { shallow } from "enzyme";
import React from "react";

import Table from "./Table";

describe("Table", () => {
  it("renders", () => {
    const wrapper = shallow(
      <Table>
        <thead />
      </Table>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("can be sortable", () => {
    const wrapper = shallow(<Table sortable />);
    expect(wrapper.prop("className")).toContain("p-table--sortable");
  });

  it("can be expanding", () => {
    const wrapper = shallow(<Table expanding />);
    expect(wrapper.prop("className")).toContain("p-table-expanding");
  });

  it("can be responsive", () => {
    const wrapper = shallow(<Table responsive />);
    expect(wrapper.prop("className")).toContain("p-table--mobile-card");
  });

  it("can pass additional classes", () => {
    const wrapper = shallow(<Table sortable className="extra-class" />);
    const className = wrapper.prop("className");
    expect(className).toContain("p-table--sortable");
    expect(className).toContain("extra-class");
  });
});
