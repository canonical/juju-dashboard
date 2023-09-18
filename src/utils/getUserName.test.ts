import { getUserName } from "utils";

describe("getUser", () => {
  it("should return user name if no prefix is present", () => {
    const userName = getUserName("eggman");
    expect(userName).toBe("eggman");
  });

  it("should return same user name if other prefix is present", () => {
    const userName = getUserName("otherPrefix-eggman");
    expect(userName).toBe("otherPrefix-eggman");
  });

  it("should remove the prefix when present", () => {
    const userName = getUserName("user-eggman");
    expect(userName).toBe("eggman");
  });
});
