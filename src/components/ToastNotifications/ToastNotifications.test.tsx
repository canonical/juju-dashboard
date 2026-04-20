import { act, render, screen } from "@testing-library/react";
import toast from "react-hot-toast";

import { toastNotification } from "utils/toastNotification";

import ToastNotifications from "./ToastNotifications";

afterEach(() => {
  act(() => {
    toast.remove();
  });
});

it("displays toast notifications", () => {
  // This uses `render` instead of `renderComponent` as the latter already includes a Toaster.
  render(<ToastNotifications toastOptions={{ duration: 0 }} />);
  act(() => {
    toastNotification("message content");
  });
  expect(screen.getByRole("status")).toHaveTextContent("message content");
});

it("displays toast notifications with the correct severity", () => {
  render(<ToastNotifications toastOptions={{ duration: 0 }} />);
  act(() => {
    toastNotification("message content", "caution");
  });
  expect(screen.getByRole("status")).toHaveAttribute("data-type", "caution");
});
