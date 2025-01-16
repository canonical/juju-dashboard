import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { Label } from "hooks/useLogout";
import { thunks as appThunks } from "store/app";
import * as dashboardStore from "store/store";
import { renderComponent, renderWrappedHook } from "testing/utils";

import useLogout from "./useLogout";

describe("useLogout", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it("should logout", async () => {
    vi.spyOn(appThunks, "logOut").mockImplementation(
      vi.fn().mockReturnValue({ type: "logOut", catch: vi.fn() }),
    );
    const mockUseAppDispatch = vi.fn().mockReturnValue({
      then: vi.fn().mockReturnValue({ catch: vi.fn() }),
    });
    vi.spyOn(dashboardStore, "useAppDispatch").mockReturnValue(
      mockUseAppDispatch,
    );
    const { result } = renderWrappedHook(useLogout);
    result.current();
    expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    expect(mockUseAppDispatch.mock.calls[0][0]).toMatchObject({
      type: "logOut",
    });
  });

  it("should show error when trying to logout and refresh page", async () => {
    const location = window.location;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });
    vi.spyOn(appThunks, "logOut").mockImplementation(
      vi.fn().mockReturnValue({ type: "logOut" }),
    );
    vi.spyOn(dashboardStore, "useAppDispatch").mockImplementation(
      vi
        .fn()
        .mockReturnValue((action: unknown) =>
          action instanceof Object &&
          "type" in action &&
          action.type === "logOut"
            ? Promise.reject(new Error("Error while dispatching logOut!"))
            : null,
        ),
    );
    const TestComponent = () => {
      const logout = useLogout();
      return <button onClick={logout}>Log out</button>;
    };
    renderComponent(<TestComponent />);
    await userEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    const logoutErrorNotification = screen.getByText(
      new RegExp(Label.LOGOUT_ERROR),
    );
    expect(logoutErrorNotification).toBeInTheDocument();
    expect(logoutErrorNotification.childElementCount).toBe(1);
    const refreshButton = logoutErrorNotification.children[0];
    expect(refreshButton).toHaveTextContent("refreshing");
    await userEvent.click(refreshButton, { pointerEventsCheck: 0 });
    expect(window.location.reload).toHaveBeenCalledTimes(1);
    Object.defineProperty(window, "location", {
      value: location,
    });
  });
});
