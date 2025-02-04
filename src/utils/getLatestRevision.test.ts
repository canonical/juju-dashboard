import {
  listSecretResultFactory,
  secretRevisionFactory,
} from "testing/factories/juju/juju";

import getLatestRevision from "./getLatestRevision";

describe("getLatestRevision", () => {
  it("should return value of latest revision", () => {
    const secret = listSecretResultFactory.build({
      uri: "secret:aabbccdd",
      label: "other-model",
      "latest-revision": 3,
      revisions: [
        secretRevisionFactory.build({ revision: 1 }),
        secretRevisionFactory.build({ revision: 2 }),
      ],
    });
    expect(getLatestRevision(secret)).toBe(2);
  });

  it("should return null when secret is null", () => {
    expect(getLatestRevision()).toBeNull();
  });

  it("should return null when revisions are null", () => {
    const secret = listSecretResultFactory.build({
      uri: "secret:aabbccdd",
      label: "other-model",
      "latest-revision": 3,
      revisions: [],
    });
    expect(getLatestRevision(secret)).toBeNull();
  });
});
