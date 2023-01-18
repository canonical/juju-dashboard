import {
  canAdministerModelAccess,
  generateIconPath,
  pluralize,
} from "./models";

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

describe("canAdministerModelAccess", () => {
  it("should return true when user has admin access", () => {
    const userName = "john-smith@external";
    const modelData = {
      info: {
        users: [
          {
            user: "john-smith@external",
            access: "admin",
            "display-name": "",
            "last-connection": "",
            "model-tag": "",
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
            "display-name": "",
            "last-connection": "",
            "model-tag": "",
          },
        ],
      },
    };
    expect(canAdministerModelAccess(userName, modelData.info.users)).toBe(
      false
    );
  });
});

describe("generateIconPath", () => {
  it("should return a icon URI for a promulated charm", () => {
    const charmId = "cs:mysql-12";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/mysql/icon");
  });

  it("should return a icon URI for a promulated charm with dash", () => {
    const charmId = "cs:hadoop-client-12";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/hadoop-client/icon");
  });

  it("should return a icon URI for a none promulated charm", () => {
    const charmId = "cs:~containers/kubernetes-master-1106";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe(
      "https://charmhub.io/containers-kubernetes-master/icon"
    );
  });

  it("should return a icon URI for a none promulated charm with release", () => {
    const charmId = "cs:~hatch/precise/failtester-7";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/hatch-failtester/icon");
  });

  it("should return default charm icon if the charm is local", () => {
    const charmId = "local:my-charm";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("default-charm-icon.svg");
  });

  it("should return a icon URI for a charmhub charm path", () => {
    const charmId = "ch:amd64/xenial/content-cache-425";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/content-cache/icon");
  });
});
