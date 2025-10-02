import isFeatureFlagEnabled from "./isFeatureFlagEnabled";

describe("isFeatureFlagEnabled", () => {
  it("should return true when flag is present in local storage", () => {
    localStorage.setItem("flags", JSON.stringify(["featureA"]));
    expect(isFeatureFlagEnabled("featureA")).toEqual(true);
  });

  it("should return false when flag is not present in local storage", () => {
    localStorage.setItem("flags", JSON.stringify(["featureA"]));
    expect(isFeatureFlagEnabled("featureB")).toEqual(false);
  });

  it("should handle no flags in local storage", () => {
    expect(isFeatureFlagEnabled("featureA")).toEqual(false);
  });
});
