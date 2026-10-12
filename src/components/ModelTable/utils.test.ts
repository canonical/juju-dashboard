import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelDataFactory } from "testing/factories/juju/juju";

import {
  generateCloudAndRegion,
  getCloudName,
  getCredential,
  getRegion,
} from "./utils";

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
    info: modelInfoFactory.build({
      "cloud-credential-tag": "cloudcred-amazon_eggman@external_juju",
    }),
  });
  expect(getCredential(modelData)).toStrictEqual("juju");
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
