import { render, screen } from "@testing-library/react";

import Status from "./Status";

describe("Status", () => {
  it("can display a status", () => {
    render(<Status status="middle" useIcon={false} />);
    const status = screen.getByText("middle");
    expect(status).toBeInTheDocument();
    expect(status).not.toHaveClass("status-icon");
    expect(status).not.toHaveClass("is-middle");
  });

  it("can display a provided content", () => {
    render(<Status status="middle">Upper middle</Status>);
    const status = screen.getByText("Upper middle");
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("is-middle");
  });

  it("can display an icon", () => {
    render(<Status status="middle" useIcon />);
    const status = screen.getByText("middle");
    expect(status).toHaveClass("status-icon");
    expect(status).toHaveClass("is-middle");
  });

  it("can display a count", () => {
    render(<Status status="middle" count={23} />);
    expect(screen.getByText(/(23)/)).toBeInTheDocument();
  });

  it("displays a spinner if an action log icon is running", () => {
    render(<Status actionsLogs status="Running" />);
    expect(document.querySelector(".status-icon")).toBeInTheDocument();
  });
});
