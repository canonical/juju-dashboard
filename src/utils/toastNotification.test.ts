import toast from "react-hot-toast";

import { toastNotification } from "./toastNotification";

vi.mock("react-hot-toast", () => {
  return {
    default: vi.fn(),
  };
});

it("creates a toast notification", () => {
  toastNotification("Boo!", "negative");
  expect(toast).toHaveBeenCalledWith("Boo!", { type: "negative" });
});
