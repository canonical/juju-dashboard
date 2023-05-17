import { modelStatusInfoFactory } from "testing/factories/juju/ClientV6";
import {
  controllerFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import { modelDataStatusFactory } from "../../testing/factories/juju/juju";

import {
  JAAS_CONTROLLER_UUID,
  generateCloudAndRegion,
  getCloudName,
  getControllerUUID,
  getCredential,
  getLastUpdated,
  getRegion,
  getControllerName,
} from "./shared";

describe("shared", () => {
  it("getCloudName", () => {
    const modelData = modelDataFactory.build({
      model: modelStatusInfoFactory.build({
        "cloud-tag": "cloud-aws",
      }),
    });
    expect(getCloudName(modelData)).toStrictEqual("aws");
  });

  it("getRegion", () => {
    const modelData = modelDataFactory.build({
      model: modelStatusInfoFactory.build({
        region: "au-south",
      }),
    });
    expect(getRegion(modelData)).toStrictEqual("au-south");
  });

  it("getCredential", () => {
    const modelData = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
      }),
    });
    expect(getCredential(modelData)).toStrictEqual("eggman");
  });

  it("getControllerUUID", () => {
    const modelData = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        "controller-uuid": "controller123",
      }),
    });
    expect(getControllerUUID(modelData)).toStrictEqual("controller123");
  });

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
    expect(getControllerName(modelData, controllers)).toStrictEqual(
      "default-controller"
    );
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
    expect(getControllerName(modelData, controllers)).toStrictEqual("JAAS");
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
    expect(getControllerName(modelData, controllers)).toStrictEqual(
      "controller123"
    );
  });

  it("getLastUpdated", () => {
    const modelData = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        status: modelDataStatusFactory.build({
          sine: "2019-11-12T23:49:17.148Z",
        }),
      }),
    });
    expect(getLastUpdated(modelData)).toStrictEqual("19-11-12");
  });

  it("generateCloudAndRegion", () => {
    const modelData = modelDataFactory.build({
      model: modelStatusInfoFactory.build({
        "cloud-tag": "cloud-aws",
        region: "au-south",
      }),
    });
    expect(generateCloudAndRegion(modelData)).toStrictEqual("aws/au-south");
  });
});
