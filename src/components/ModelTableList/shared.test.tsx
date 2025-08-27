import {
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV6";
import {
  controllerFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import {
  generateCloudAndRegion,
  getCloudName,
  getControllerName,
  getControllerUUID,
  getCredential,
  getLastUpdated,
  getRegion,
  generateTableHeaders,
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
      "default-controller",
    );
  });

  it("can get a controller name from a controller", () => {
    const controllers = {
      "wss://test.com/api": [
        controllerFactory.build({
          name: "a controller",
          uuid: "controller123",
        }),
      ],
    };
    const modelData = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        "controller-uuid": "controller123",
      }),
    });
    expect(getControllerName(modelData, controllers)).toStrictEqual(
      "a controller",
    );
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
      "controller123",
    );
  });

  it("getLastUpdated", () => {
    const modelData = modelDataFactory.build({
      info: modelDataInfoFactory.build({
        status: detailedStatusFactory.build({
          since: "2019-11-12T23:49:17.148Z",
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

  describe("generateTableHeaders", () => {
    it("can display an owner column", () => {
      const headers = generateTableHeaders("status", 5, { showOwner: true });
      expect(headers).toHaveLength(8);
      expect(headers[2].content).toBe("Owner");
    });

    it("can display a status column", () => {
      const headers = generateTableHeaders("status", 5, { showStatus: true });
      expect(headers).toHaveLength(8);
      expect(headers[2].content).toBe("Status");
    });

    it("can display both status and owner column", () => {
      const headers = generateTableHeaders("status", 5, {
        showOwner: true,
        showStatus: true,
      });
      expect(headers).toHaveLength(9);
      expect(headers[2].content).toBe("Owner");
      expect(headers[3].content).toBe("Status");
    });

    it("can display a region column", () => {
      const headers = generateTableHeaders("status", 5);
      expect(headers[2].content).toBe("Region");
    });

    it("can display a cloud/region column", () => {
      const headers = generateTableHeaders("status", 5, { showCloud: true });
      expect(headers[2].content).toBe("Cloud/Region");
    });
  });
});
