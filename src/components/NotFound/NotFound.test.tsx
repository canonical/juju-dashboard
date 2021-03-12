import { mount } from "enzyme";

import NotFound from "./NotFound";

describe("NotFound", () => {
  it("should display correct text", () => {
    const wrapper = mount(
      <NotFound message="Wut?">
        <p>This thing cannot be found</p>
      </NotFound>
    );
    expect(wrapper.find("h1").length).toBe(1);
    expect(wrapper.find("h2").text()).toEqual("Wut?");
    expect(wrapper.find(".not-found__content p").text()).toEqual(
      "This thing cannot be found"
    );
  });
});
