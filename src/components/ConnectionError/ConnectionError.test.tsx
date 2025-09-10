import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import ConnectionError from "./ConnectionError";

describe("ConnectionError", () => {
  let location: Location;

  beforeEach(() => {
    ({ location } = window);
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: location,
    });
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
    renderComponent(<ConnectionError />, { state });
    const auditLogsErrorNotification = screen.getByText(/Oops!/);
    expect(auditLogsErrorNotification.childElementCount).toBe(1);
    const [refreshButton] = auditLogsErrorNotification.children;
    expect(refreshButton).toHaveTextContent("refresh");
    await userEvent.click(refreshButton, { pointerEventsCheck: 0 });
    expect(window.location.reload).toHaveBeenCalled();
  });
});
