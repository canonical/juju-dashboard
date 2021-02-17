import { shallow } from "enzyme";

import Aside from "./Aside";

describe("Aside", () => {
  it("should display without width or pinned status", () => {
    const wrapper = shallow(
      <Aside>
        <p>Aside content</p>
      </Aside>
    );
    expect(wrapper.find(".l-aside").length).toBe(1);
    expect(wrapper.find(".is-narrow").length).toBe(0);
    expect(wrapper.find(".is-wide").length).toBe(0);
    expect(wrapper.find(".is-pinned").length).toBe(0);
  });

  it("should display correct narrow width", () => {
    const wrapper = shallow(
      <Aside width="narrow">
        <p>Aside content</p>
      </Aside>
    );
    expect(wrapper.find(".is-narrow").length).toBe(1);
  });

  it("should display correct wide width", () => {
    const wrapper = shallow(
      <Aside width="wide">
        <p>Aside content</p>
      </Aside>
    );
    expect(wrapper.find(".is-wide").length).toBe(1);
  });

  it("should display correct pinned status", () => {
    const wrapper = shallow(
      <Aside pinned={true}>
        <p>Aside content</p>
      </Aside>
    );
    expect(wrapper.find(".is-pinned").length).toBe(1);
  });
});
