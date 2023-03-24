import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DivButton from "./DivButton";

describe("DivButton", () => {
  it("calls the on-click handler when clicked", async () => {
    const onClick = jest.fn();
    render(<DivButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls the on-click handler when space is pressed", async () => {
    const onClick = jest.fn();
    render(<DivButton onClick={onClick} />);
    await userEvent.type(screen.getByRole("button"), " ");
    expect(onClick).toHaveBeenCalled();
  });

  it("calls the on-click handler when enter is pressed", async () => {
    const onClick = jest.fn();
    render(<DivButton onClick={onClick} />);
    await userEvent.type(screen.getByRole("button"), "{enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("does not call the on-click handler when another key is pressed", async () => {
    const onClick = jest.fn();
    render(<DivButton onClick={onClick} />);
    await userEvent.type(screen.getByRole("button"), "{shift}", {
      skipClick: true,
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});
