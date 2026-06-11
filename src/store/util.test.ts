import { toSerializableSourceError } from "./util";

describe("toSerializableSourceError", () => {
  it("handles a null error", () => {
    expect(toSerializableSourceError(null)).toBeNull();
  });

  it("handles Error", () => {
    expect(
      toSerializableSourceError({
        source: new Error("Uh oh!"),
        message: "This is an error",
      }),
    ).toStrictEqual({
      source: "Uh oh!",
      message: "This is an error",
    });
  });
});
