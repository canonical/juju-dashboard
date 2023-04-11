import {
  additionalControllerFactory,
  controllerFactory,
} from "testing/factories/juju/juju";

import { isJAASFromPath } from "./controllers";

describe("isJAASFromPath", () => {
  it("identifies a JAAS controller from the path", () => {
    expect(isJAASFromPath(controllerFactory.build())).toBe(true);
  });

  it("identifies a non-JAAS controller from the path", () => {
    expect(isJAASFromPath(additionalControllerFactory.build())).toBe(false);
  });
});
