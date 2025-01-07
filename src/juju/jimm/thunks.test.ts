import { unwrapResult } from "@reduxjs/toolkit";
import { vi } from "vitest";

import type { WindowConfig } from "types";

import { endpoints } from "./api";
import { logout, whoami } from "./thunks";

describe("thunks", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "wss://example.com/api",
    } as WindowConfig;
  });

  afterEach(() => {
    delete window.jujuDashboardConfig;
  });

  it("logout", async () => {
    const action = logout();
    await action(vi.fn(), vi.fn(), null);
    expect(global.fetch).toHaveBeenCalledWith(endpoints().logout, {
      credentials: "include",
    });
  });

  it("logout handles unsuccessful requests", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 500 });
    const action = logout();
    const response = await action(vi.fn(), vi.fn(), null);
    expect("error" in response ? response.error.message : null).toBe(
      "Unable to log out: non-success response",
    );
  });

  it("logout handles errors", async () => {
    fetchMock.mockRejectedValue("404");
    const action = logout();
    const response = await action(vi.fn(), vi.fn(), null);
    expect("error" in response ? response.error.message : null).toBe(
      "Unable to log out: 404",
    );
  });

  it("whoami returns a user", async () => {
    const action = whoami();
    await action(vi.fn(), vi.fn(), null);
    expect(global.fetch).toHaveBeenCalledWith(endpoints().whoami, {
      credentials: "include",
    });
  });

  it("whoami handles non-authenticated user", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 403 });
    const action = whoami();
    const response = await action(vi.fn(), vi.fn(), null);
    expect(global.fetch).toHaveBeenCalledWith(endpoints().whoami, {
      credentials: "include",
    });
    expect(unwrapResult(response)).toBeNull();
  });

  it("whoami handles non-authenticated user", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({}), { status: 401 });
    const action = whoami();
    const response = await action(vi.fn(), vi.fn(), null);
    expect(global.fetch).toHaveBeenCalledWith(endpoints().whoami, {
      credentials: "include",
    });
    expect(unwrapResult(response)).toBeNull();
  });

  it("whoami unsuccessful requests", async () => {
    fetchMock.mockResponse(JSON.stringify({}), { status: 500 });
    const action = whoami();
    const response = await action(vi.fn(), vi.fn(), null);
    expect("error" in response ? response.error.message : null).toBe(
      "Unable to get user details: non-success response",
    );
  });

  it("whoami handles errors", async () => {
    fetchMock.mockRejectedValue("404");
    const action = whoami();
    const response = await action(vi.fn(), vi.fn(), null);
    expect("error" in response ? response.error.message : null).toBe(
      "Unable to get user details: 404",
    );
  });
});
