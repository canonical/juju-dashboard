import { shallow } from "enzyme";

import Button from "./Button";

describe("Button", () => {
  it("should display button text", () => {
    const wrapper = shallow(
      <Button onClick={() => jest.fn()}>Button text</Button>
    );
    expect(wrapper.find("button").text()).toStrictEqual("Button text");
  });

  it("should call handler when clicked", () => {
    const handleClick = jest.fn();
    const wrapper = shallow(
      <Button onClick={() => handleClick()}>Button text</Button>
    );
    wrapper.find("button").simulate("click");
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
