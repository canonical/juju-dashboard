import { render, screen } from "@testing-library/react";
import type { Toast } from "react-hot-toast";

import ToastNotification from "./ToastNotification";

describe("Toast Card", () => {
  let toastInstance: Toast;
  beforeEach(() => {
    toastInstance = {
      createdAt: 1623162274616,
      duration: 5000,
      id: "2",
      message: "message content",
      pauseDuration: 0,
      style: {},
      type: "success",
      visible: true,
      ariaProps: {
        role: "status",
        "aria-live": "assertive",
      },
      dismissed: false,
    };
  });

  it("should display message", () => {
    render(<ToastNotification toastInstance={toastInstance} />);
    expect(screen.getByText("message content")).toHaveClass(
      "toast-card__message",
    );
  });

  it("should display as correct type", () => {
    const { container } = render(
      <ToastNotification toastInstance={toastInstance} />,
    );
    expect(container.firstChild).toHaveAttribute("data-type", "success");
  });
});
