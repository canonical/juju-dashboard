import getMajorMinorVersion from "./getMajorMinorVersion";

describe("getMajorMinorVersion", () => {
  it("should handle semver", () => {
    expect(getMajorMinorVersion("1.2.3")).toBe(1.2);
  });

  it("should handle pre-release labels", () => {
    expect(getMajorMinorVersion("1.2.3-alpha")).toBe(1.2);
  });
});
