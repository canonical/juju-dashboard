import isHigherSemver from "./isHigherSemver";

it("handles higher major version", () => {
  expect(isHigherSemver("2.2.30", "1.2.30")).toBe(true);
  expect(isHigherSemver("1.2.30", "2.2.30")).toBe(false);
});

it("handles higher minor version", () => {
  expect(isHigherSemver("1.3.30", "1.2.30")).toBe(true);
  expect(isHigherSemver("1.2.30", "1.3.30")).toBe(false);
});

it("handles higher patch version", () => {
  expect(isHigherSemver("1.2.40", "1.2.30")).toBe(true);
  expect(isHigherSemver("1.2.30", "1.2.40")).toBe(false);
});

it("handles equal versions", () => {
  expect(isHigherSemver("1.2.30", "1.2.30")).toBe(false);
});
