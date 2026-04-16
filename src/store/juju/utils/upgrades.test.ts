import { isLTS, requiresMigration } from "./upgrades";

describe("isLTS", () => {
  it("is an LTS if it is 3.6.x", () => {
    expect(isLTS("3.6.36")).toBe(true);
  });

  it("is not an LTS if it is anything else", () => {
    expect(isLTS("3.7.36")).toBe(false);
  });
});

describe("requiresMigration", () => {
  it("requires migration if there is a major version change", () => {
    expect(requiresMigration("1.2.3", "2.2.3")).toBe(true);
  });

  it("requires migration if there is a minor version change", () => {
    expect(requiresMigration("1.2.3", "1.3.3")).toBe(true);
  });

  it("requires migration if there is a patch version change that is higher than the controller", () => {
    expect(requiresMigration("1.2.3", "1.2.4")).toBe(true);
  });

  it("does not requires migration if the patch version is lower than the controller", () => {
    expect(requiresMigration("1.2.3", "1.2.2")).toBe(false);
  });

  it("does not requires migration the version is the same", () => {
    expect(requiresMigration("1.2.3", "1.2.3")).toBe(false);
  });

  it("handles values that are 0", () => {
    expect(requiresMigration("0.0.3", "2.2.3")).toBe(true);
    expect(requiresMigration("0.0.0", "0.0.1")).toBe(true);
    expect(requiresMigration("1.2.0", "1.3.0")).toBe(true);
  });
});
