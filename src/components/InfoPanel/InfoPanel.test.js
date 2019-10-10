import React from "react";
import { shallow } from "enzyme";

import InfoPanel from "./InfoPanel";

describe("Info Panel", () => {
  const modelStatus = {
    model: {
      name: "fake-model",
      region: "eu-ireland",
      type: "iaas",
      cloudTag: "cloud-google",
      sla: "Unsupported"
    }
  };

  it("renders without crashing and matches snapshot", () => {
    const wrapper = shallow(<InfoPanel />);
    expect(wrapper).toMatchSnapshot();
  });

  it("displays correct model status info", () => {
    const wrapper = shallow(<InfoPanel modelStatus={modelStatus} />);
    expect(wrapper.find('[data-name="name"]').text()).toStrictEqual(
      "fake-model"
    );
  });
});
