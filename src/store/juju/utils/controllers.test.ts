import {
  additionalControllerFactory,
  controllerFactory,
} from "testing/factories/juju/juju";

import { JAAS_CONTROLLER_UUID, isJAASFromUUID } from "./controllers";

describe("isJAASFromUUID", () => {
  it("identifies a JAAS controller from the UUID", () => {
    expect(
      isJAASFromUUID(controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }))
    ).toBe(true);
  });

  it("identifies a non-JAAS controller from the UUID", () => {
    expect(isJAASFromUUID(additionalControllerFactory.build())).toBe(false);
  });
});
