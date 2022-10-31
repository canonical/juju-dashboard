import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RadioInputBox from "./RadioInputBox";

describe("RadioInputBox", () => {
  it("opens to reveal a description and children on select", async () => {
    const child = <div>I am a child, wahhh</div>;
    const onSelect = jest.fn();
    render(
      <RadioInputBox
        name="Action"
        description="I am the description"
        onSelect={onSelect}
      >
        {child}
      </RadioInputBox>
    );
    const radio = document.querySelector(".radio-input-box");
    expect(radio).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(screen.getByRole("radio"));
    expect(onSelect).toHaveBeenCalledWith("Action");
    expect(radio).toHaveAttribute("aria-expanded", "true");
  });

  it("opens if the selectedInput matches the name", async () => {
    const child = <div>I am a child, wahhh</div>;
    const onSelect = jest.fn();
    render(
      <RadioInputBox
        name="Action"
        description="I am the description"
        selectedInput="Action"
        onSelect={onSelect}
      >
        {child}
      </RadioInputBox>
    );
    expect(document.querySelector(".radio-input-box")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });
});
