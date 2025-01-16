import { screen, waitFor } from "@testing-library/react";
import MockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import { axiosInstance } from "axios-instance";
import { endpoints } from "juju/jimm/api";
import { thunks as appThunks } from "store/app";
import { renderComponent } from "testing/utils";

import Permissions from "./Permissions";

const mock = new MockAdapter(axiosInstance);

describe("Permissions", () => {
  const consoleError = console.error;

  beforeEach(() => {
    console.error = vi.fn();
    mock.reset();
    mock.onGet(endpoints().whoami).reply(200, {
      data: {
        "display-name": "jimm-test",
        email: "jimm-test@example.com",
      },
    });
    vi.spyOn(appThunks, "logOut").mockImplementation(
      vi.fn().mockReturnValue({ type: "logOut", catch: vi.fn() }),
    );
  });

  afterEach(() => {
    console.error = consoleError;
    vi.restoreAllMocks();
  });

  it("displays ReBAC Admin", () => {
    renderComponent(<Permissions />);
    expect(screen.getByText("Canonical ReBAC Admin")).toBeInTheDocument();
  });

  it("does not display login for successful responses", async () => {
    mock.onGet("/test").reply(200, {});
    renderComponent(<Permissions />);
    await axiosInstance.get("/test");
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });

  it("does not display login for non-authentication errors", async () => {
    mock.onGet("/test").reply(500, {});
    renderComponent(<Permissions />);
    axiosInstance.get("/test").catch(() => {
      // Don't do anything with this 500 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });

  it("displays login for authentication errors", async () => {
    mock.onGet("/test").reply(401, {});
    renderComponent(<Permissions />);
    axiosInstance.get("/test").catch(() => {
      // Don't do anything with this 401 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).toHaveBeenCalledTimes(1);
    });
  });

  it("does not display login on authentication errors from /auth/whoami", async () => {
    mock.onGet(endpoints().whoami).reply(401, {});
    renderComponent(<Permissions />);
    await axiosInstance.get(endpoints().whoami).catch(() => {
      // Don't do anything with this 401 error.
    });
    await waitFor(() => {
      expect(appThunks.logOut).not.toHaveBeenCalled();
    });
  });
});
