import getPatchVersion from "./getPatchVersion";

it("handles semver", () => {
  expect(getPatchVersion("1.2.30")).toBe(30);
});

it("handles pre-release labels", () => {
  expect(getPatchVersion("1.2.30-alpha")).toBe(30);
});

it("handles non-semver", () => {
  expect(getPatchVersion("1.2")).toBeNull();
});
