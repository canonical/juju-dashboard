import { mount } from "enzyme";

import ContentReveal from "./ContentReveal";

describe("Content Reveal", () => {
  it("should show children as content", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(wrapper.find("p").text()).toStrictEqual("Banner text");
  });

  it("should show correct title if only text", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(wrapper.find(".content-reveal__title").text()).toStrictEqual(
      "Foo bar"
    );
  });

  it("should show correct title if only text and JSX", () => {
    const title = <div>JSX Title</div>;
    const wrapper = mount(
      <ContentReveal title={title} openByDefault={false}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(wrapper.find(".content-reveal__title").contains(title)).toBe(true);
  });

  it("should open by default if set", () => {
    const wrapper = mount(
      <ContentReveal title="Foo bar" openByDefault={true}>
        <p>Banner text</p>
      </ContentReveal>
    );
    expect(
      wrapper.find(".content-reveal__content").prop("aria-hidden")
    ).toStrictEqual(false);
  });
});
