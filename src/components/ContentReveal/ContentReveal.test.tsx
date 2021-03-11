import { mount } from "enzyme";

import ContentReveal from "./ContentReveal";

describe("Content Reveal", () => {
  it("should show children as content", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" showContent={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Banner text");
  });

  it("should show correct title", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" showContent={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(wrapper.find(".content-reveal__title").text()).toStrictEqual(
      "Foo bar"
    );
  });

  it("should open by default if set", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" showContent={true}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(
      wrapper.find(".content-reveal__content").prop("aria-hidden")
    ).toStrictEqual(false);
  });
});
