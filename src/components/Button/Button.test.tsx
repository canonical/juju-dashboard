import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from "./Button";

describe("Button", () => {
  it("should display button text", () => {
    render(<Button onClick={() => jest.fn()}>Button text</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Button text");
  });

  it("should call handler when clicked", async () => {
    const handleClick = jest.fn();
    render(<Button onClick={() => handleClick()}>Button text</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
