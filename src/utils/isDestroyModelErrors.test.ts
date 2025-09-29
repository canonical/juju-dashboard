import isDestroyModelErrors from "./isDestroyModelErrors";

describe("isDestroyModelErrors", () => {
  it("should return true for a valid input of type DestroyModelErrors", () => {
    const errors = [
      ["model-1234", "Model not found"],
      ["model-5678", "Permission denied"],
    ];
    expect(isDestroyModelErrors(errors)).toBe(true);
  });

  it("should return true for an empty array", () => {
    const errors: string[] = [];
    expect(isDestroyModelErrors(errors)).toBe(true);
  });

  it("should return false if the input is not an array", () => {
    expect(isDestroyModelErrors(null)).toBe(false);
    expect(isDestroyModelErrors(undefined)).toBe(false);
    expect(isDestroyModelErrors("not an array")).toBe(false);
    expect(isDestroyModelErrors({ 0: "a", 1: new Error() })).toBe(false);
  });

  it("should return false if an item in the array is not an array", () => {
    const errors = [["model-1234", "Model not found"], "not a tuple"];
    expect(isDestroyModelErrors(errors)).toBe(false);
  });

  it("should return false if an inner array has the wrong length", () => {
    const errors = [["model-1234", "Model not found", "extra-data"]];
    expect(isDestroyModelErrors(errors)).toBe(false);
  });

  it("should return false if the first element is not a string", () => {
    const errors = [[1234, "Model not found"]];
    expect(isDestroyModelErrors(errors)).toBe(false);
  });

  it("should return false if the second element is not a string", () => {
    const errors = [["model-1234", 1234]];
    expect(isDestroyModelErrors(errors)).toBe(false);
  });
});
