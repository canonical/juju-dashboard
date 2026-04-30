import getModelURL from "./getModelURL";

describe("getModelURL", () => {
  it("should replace /api with the model path", () => {
    const result = getModelURL("wss://controller.example.com/api", "abc-123");
    expect(result).toBe("wss://controller.example.com/model/abc-123/api");
  });
});
