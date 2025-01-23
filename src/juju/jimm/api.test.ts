import type { WindowConfig } from "types";

import { endpoints } from "./api";

describe("JIMM API", () => {
  afterEach(() => {
    delete window.jujuDashboardConfig;
  });

  it("generates correct endpoints", () => {
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "ws://example.com/api",
    } as WindowConfig;
    const { login, logout, whoami } = endpoints();
    expect(login).toEqual("http://example.com/auth/login");
    expect(logout).toEqual("http://example.com/auth/logout");
    expect(whoami).toEqual("http://example.com/auth/whoami");
  });

  it("generates correct endpoints for secure controller API", () => {
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "wss://example.com/api",
    } as WindowConfig;
    const { login, logout, whoami } = endpoints();
    expect(login).toEqual("https://example.com/auth/login");
    expect(logout).toEqual("https://example.com/auth/logout");
    expect(whoami).toEqual("https://example.com/auth/whoami");
  });
});
