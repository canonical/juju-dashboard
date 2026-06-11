import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TruncatedDetails from "./TruncatedDetails";

describe("TruncatedDetails", () => {
  const offsetWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "offsetWidth",
  );
  const scrollWidth = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "scrollWidth",
  );

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    if (offsetWidth) {
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth);
    }
    if (scrollWidth) {
      Object.defineProperty(HTMLElement.prototype, "scrollWidth", scrollWidth);
    }
  });

  it("does not render a toggle when the text fits", () => {
    render(
      <TruncatedDetails items={["destroy-controller", "destroy-model"]} />,
    );

    expect(
      screen.queryByRole("button", { name: "Show more" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("destroy-controller, destroy-model")).toHaveClass(
      "u-truncate",
    );
  });

  it("renders a show more toggle when the text is truncated", () => {
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 200,
    });

    render(
      <TruncatedDetails
        items={[
          "destroy-controller",
          "destroy-model",
          "detach-storage",
          "remove-application",
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Show more" }),
    ).toBeInTheDocument();
  });

  it("toggles between collapsed and expanded text", async () => {
    const user = userEvent.setup();
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: 200,
    });
    render(
      <TruncatedDetails
        items={[
          "destroy-controller",
          "destroy-model",
          "detach-storage",
          "remove-application",
        ]}
      />,
    );

    const content = screen.getByText(
      "destroy-controller, destroy-model, detach-storage, remove-application",
    );
    expect(screen.getByRole("button", { name: "Show more" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(content).toHaveClass("u-truncate");

    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(screen.getByRole("button", { name: "Show less" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(content).not.toHaveClass("u-truncate");
  });
});
