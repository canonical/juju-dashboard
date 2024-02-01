import { render } from "@testing-library/react";

import PanelInlineErrors from "./PanelInlineErrors";

describe("PanelInlineErrors", () => {
  it("shouldn't render if there is no inline error", () => {
    render(<PanelInlineErrors inlineErrors={[null]} />);
    const notifications = document.getElementsByClassName(
      "p-notification__message",
    );
    expect(notifications).toHaveLength(0);
  });

  it("should render inline errors", () => {
    render(<PanelInlineErrors inlineErrors={["Error 1", "Error 2"]} />);
    const notifications = document.getElementsByClassName(
      "p-notification__message",
    );
    expect(notifications).toHaveLength(2);
    expect(notifications[0]).toHaveTextContent(/Error 1/);
    expect(notifications[1]).toHaveTextContent(/Error 2/);
  });
});
