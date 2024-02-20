import { listSecretResultFactory } from "testing/factories/juju/juju";
import { secretIsAppOwned } from "utils";

describe("secretIsAppOwned", () => {
  it("should handle app owned secrets", () => {
    const secret = listSecretResultFactory.build({
      "owner-tag": "application-etcd",
    });
    expect(secretIsAppOwned(secret)).toBe(true);
  });

  it("should handle model owned secrets", () => {
    const secret = listSecretResultFactory.build({ "owner-tag": "model-test" });
    expect(secretIsAppOwned(secret)).toBe(false);
  });
});
