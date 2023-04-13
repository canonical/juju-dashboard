import {
  modelDataFactory,
  modelDataInfoFactory,
  controllerFactory,
} from "testing/factories/juju/juju";

import { getStatusValue, JAAS_CONTROLLER_UUID } from "./shared";

describe("shared", () => {
  describe("getStatusValue", () => {
    it("can get a controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({
            uuid: "controller123",
            path: "default-controller",
          }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": "controller123",
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("default-controller");
    });

    it("can get the JAAS controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({ uuid: JAAS_CONTROLLER_UUID }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": JAAS_CONTROLLER_UUID,
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("JAAS");
    });

    it("handles an unknown controller name", () => {
      const controllers = {
        "wss://test.com/api": [
          controllerFactory.build({
            uuid: "something-else",
          }),
        ],
      };
      const modelData = modelDataFactory.build({
        info: modelDataInfoFactory.build({
          "controller-uuid": "controller123",
        }),
      });
      expect(
        getStatusValue(modelData, "controllerName", controllers)
      ).toStrictEqual("controller123");
    });
  });
});
