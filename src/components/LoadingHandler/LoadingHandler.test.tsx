import { render, screen } from "@testing-library/react";

import LoadingHandler, { TestId } from "./LoadingHandler";

describe("LoadingHandler", () => {
  it("returns a spinner if no data and set to loading", () => {
    render(<LoadingHandler hasData={false} loading={true} noDataMessage="" />);
    expect(screen.getByTestId(TestId.LOADING)).toBeInTheDocument();
  });

  it("returns a message if no data and not loading", () => {
    const message = "No data provided";
    render(
      <LoadingHandler
        hasData={false}
        loading={false}
        noDataMessage={message}
      />,
    );
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("returns the children if data and not loading", () => {
    const children = <div>I am a child, wahhhh</div>;
    render(
      <LoadingHandler hasData={true} loading={false} noDataMessage="">
        {children}
      </LoadingHandler>,
    );
    expect(screen.getByText("I am a child, wahhhh")).toBeInTheDocument();
  });
});
