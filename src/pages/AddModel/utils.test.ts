import { Label } from "./types";
import { getCredentialError } from "./utils";

describe("AddModel utils", () => {
  describe("getCredentialError", () => {
    it("returns a cloud-specific message when cloud is a string", () => {
      expect(getCredentialError("cloud-aws")).toBe(
        "No credentials available for aws. Contact admin or choose a different cloud.",
      );
    });

    it("returns the generic credential error when cloud is not a string", () => {
      expect(getCredentialError(undefined)).toBe(
        Label.REQUIRED_CREDENTIAL_ERROR,
      );
    });
  });
});
