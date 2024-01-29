import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RelativeDate from "./RelativeDate";

describe("RelativeDate", () => {
  const yesterday = new Date(Date.now() - 60 * 1000 * 60 * 24);

  it("displays a relative date", async () => {
    render(<RelativeDate datetime={yesterday.toISOString()} />);
    expect(screen.getByText("1 day ago")).toBeInTheDocument();
  });

  it("displays the tooltip if the content is truncated", async () => {
    render(<RelativeDate datetime={yesterday.toISOString()} />);
    const fullDate = yesterday.toLocaleString();
    expect(screen.queryByText(fullDate)).not.toBeInTheDocument();
    await userEvent.hover(screen.getByText("1 day ago"));
    expect(screen.getByText(fullDate)).toBeInTheDocument();
  });
});
