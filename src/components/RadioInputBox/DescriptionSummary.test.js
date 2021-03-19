import { mount } from "enzyme";

import DescriptionSummary from "./DescriptionSummary";

describe("DescriptionSummary", () => {
  it("returns a details component if the description is longer than 30 characters", () => {
    const description =
      "The number of coding chunks, i.e. the number of additional chunks computed by the encoding functions. If there are 2 coding chunks, it means 2 OSDs can be out without losing data. ";
    const wrapper = mount(<DescriptionSummary description={description} />);
    expect(wrapper).toMatchSnapshot();
  });

  it("returns just the text if the description is shorter than 30 characters", () => {
    const description = "The name of the profile";
    const wrapper = mount(<DescriptionSummary description={description} />);
    expect(wrapper.children().equals(<span>{description}</span>)).toBe(true);
  });
});
