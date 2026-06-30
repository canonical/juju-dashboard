import { Label } from "./types";
import { getBooleanSchema, getCredentialError } from "./utils";

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

  describe("getBooleanSchema", () => {
    it("returns an entry for every boolean field in the catalog", () => {
      const schema = getBooleanSchema();
      // Spot-check a known boolean field from each catalog
      console.log(schema);
      expect(schema).toHaveProperty("disable-network-management");
      expect(schema).toHaveProperty("allocate-public-ip");
    });

    it("does not include non-boolean fields", () => {
      const schema = getBooleanSchema();
      // Plain string and numeric fields should be absent
      expect(schema).not.toHaveProperty("default-space");
      expect(schema).not.toHaveProperty("net-bond-reconfigure-delay");
    });

    it("returns Yup boolean schemas for each entry", () => {
      const schema = getBooleanSchema();
      const entry = schema["disable-network-management"];
      expect(entry).toBeDefined();
      // Yup boolean schema accepts true/false and casts "true"/"false" strings
      expect(entry.isValidSync(true)).toBe(true);
      expect(entry.isValidSync(false)).toBe(true);
    });
  });
});
