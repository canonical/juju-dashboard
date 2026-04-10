import { controllerFactory } from "testing/factories/juju/juju";

import { getControllerByUUID } from "./controllers";

describe("getControllerByUUID", () => {
  it("can get a controller", () => {
    const controller = controllerFactory.build({
      uuid: "controller123",
    });
    const controllers = {
      "wss://example.com": [
        controller,
        controllerFactory.build({
          uuid: "controller456",
        }),
      ],
    };
    expect(getControllerByUUID(controllers, "controller123")).toStrictEqual(
      controller,
    );
  });

  it("handles an unknown controller", () => {
    const controllers = {
      "wss://example.com": [
        controllerFactory.build({
          uuid: "controller123",
        }),
        controllerFactory.build({
          uuid: "controller456",
        }),
      ],
    };
    expect(getControllerByUUID(controllers, "nothing123")).toBeNull();
  });
});
