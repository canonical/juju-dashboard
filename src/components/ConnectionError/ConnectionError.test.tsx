import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import reactHotToast, { Toaster } from "react-hot-toast";

import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import ConnectionError from "./ConnectionError";

describe("ConnectionError", () => {
  let location: Location;

  beforeEach(() => {
    location = window.location;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: jest.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: location,
    });
    act(() => reactHotToast.remove());
  });

  it("displays connection errors", () => {
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { connectionError: "Can't connect" } });
    renderComponent(<ConnectionError />, { state });
    expect(screen.getByText(/Can't connect/)).toBeInTheDocument();
  });

  it("can refresh the window", async () => {
    const state = rootStateFactory
      .withGeneralConfig()
      .build({ general: { connectionError: "Can't connect" } });
    renderComponent(<ConnectionError />, { state });
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();
  });

  it("displays Audit Logs errors", async () => {
    const state = rootStateFactory.withGeneralConfig().build({
      juju: { auditEvents: { errors: "Oops!" } },
    });
    const {
      result: { rerender },
    } = renderComponent(<ConnectionError />, { state });
    rerender(<Toaster />);
    const auditLogsErrorNotification = screen.getByText(/Oops!/);
    expect(auditLogsErrorNotification.childElementCount).toBe(1);
    const refreshButton = auditLogsErrorNotification.children[0];
    expect(refreshButton).toHaveTextContent("refresh");
    await userEvent.click(refreshButton);
    expect(window.location.reload).toHaveBeenCalled();
  });
});
