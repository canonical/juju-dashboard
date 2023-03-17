import { getControllerAPIEndpointErrors } from "./index";

describe("getControllerAPIEndpointErrors", () => {
  it("should handle secure protocol", () => {
    expect(
      getControllerAPIEndpointErrors("wss://example.com:80/api")
    ).toBeNull();
  });

  it("should handle non-secure protocol", () => {
    expect(
      getControllerAPIEndpointErrors("ws://example.com:80/api")
    ).toBeNull();
  });

  it("should handle absolute path only", () => {
    expect(getControllerAPIEndpointErrors("/api")).toBeNull();
  });

  it("should error if it is not set", () => {
    expect(getControllerAPIEndpointErrors()).toBe(
      "controllerAPIEndpoint is not set."
    );
  });

  it("should error if it does not end with /api", () => {
    expect(getControllerAPIEndpointErrors("wss://example.com:80/notapi")).toBe(
      "controllerAPIEndpoint (wss://example.com:80/notapi) must end with /api."
    );
  });

  it("should error if it does not contain a hostname or IP", () => {
    expect(getControllerAPIEndpointErrors("wss:///api")).toBe(
      "controllerAPIEndpoint (wss:///api) must be an absolute path or contain a hostname or IP."
    );
  });

  it("should error if it does not have a websocket protocol", () => {
    expect(getControllerAPIEndpointErrors("http://example.com:80/api")).toBe(
      "controllerAPIEndpoint (http://example.com:80/api) must be an absolute path or begin with ws:// or wss://."
    );
  });

  it("should error if it does not contain a protocol", () => {
    expect(getControllerAPIEndpointErrors("example.com:80/api")).toBe(
      "controllerAPIEndpoint (example.com:80/api) must be an absolute path or begin with ws:// or wss://."
    );
  });
});
