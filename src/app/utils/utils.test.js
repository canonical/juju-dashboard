import {
  pluralize,
  formatFriendlyDateToNow,
  canAdministerModelAccess,
} from "./utils";

describe("pluralize", () => {
  it("should correctly handle a single item", () => {
    const singleItems = 1;
    const label = pluralize(singleItems, "item");
    expect(label).toBe("item");
  });
  it("should correctly handle multiple items", () => {
    const multipleItems = 2;
    const label = pluralize(multipleItems, "item");
    expect(label).toBe("items");
  });
  it("should treat special cases correctly", () => {
    const multipleItems = 2;
    const label = pluralize(multipleItems, "allocating");
    expect(label).toBe("allocating");
  });
});

describe("formatFriendlyDateToNow", () => {
  it("should return a human friendly time string", () => {
    const timeOneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const friendlyDate = formatFriendlyDateToNow(timeOneHourAgo);
    expect(friendlyDate).toBe("about 1 hour ago");
  });
});

describe("canAdministerModelAccess", () => {
  it("should return true when user has admin access", () => {
    const userName = "john-smith@external";
    const modelData = {
      info: {
        users: [
          {
            user: "john-smith@external",
            access: "admin",
          },
        ],
      },
    };
    expect(canAdministerModelAccess(userName, modelData.info.users)).toBe(true);
  });

  it("should return false when user has read access", () => {
    const userName = "joan-smith@external";
    const modelData = {
      info: {
        users: [
          {
            user: "joan-smith@external",
            access: "read",
          },
        ],
      },
    };
    expect(canAdministerModelAccess(userName, modelData.info.users)).toBe(
      false
    );
  });
});
