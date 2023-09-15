import {
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV6";
import {
  modelDataFactory,
  modelDataApplicationFactory,
  modelDataUnitFactory,
} from "testing/factories/juju/juju";

import {
  canAdministerModel,
  generateIconPath,
  pluralize,
  getModelStatusGroupData,
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

describe("canAdministerModel", () => {
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
    expect(canAdministerModel(userName, modelData.info.users)).toBe(true);
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
    expect(canAdministerModel(userName, modelData.info.users)).toBe(false);
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

describe("getModelStatusGroupData", () => {
  it("should handle 'running' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "running",
          }),
        }),
      },
      model: modelStatusInfoFactory.build({
        "cloud-tag": "cloud-aws",
      }),
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("running");
  });

  it("should handle 'alert' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "running",
          }),
        }),
        etcd: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "unknown",
          }),
        }),
      },
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("alert");
  });

  it("should handle 'blocked' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "running",
          }),
        }),
        etcd: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "unknown",
          }),
        }),
        calico: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            status: "blocked",
          }),
        }),
      },
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("blocked");
  });

  it("should add messages for 'blocked' apps and units", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's running message should not be included.",
            status: "running",
          }),
        }),
        etcd: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's alert app message should not be included.",
            status: "unknown",
          }),
          units: {
            "etcd/2": modelDataUnitFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's blocked message should be included!",
                status: "lost",
              }),
            }),
          },
        }),
        calico: modelDataApplicationFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's blocked message should be included!",
            status: "blocked",
          }),
          units: {
            "calico/0": modelDataUnitFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's running message should not be included.",
                status: "available",
              }),
            }),
            "calico/1": modelDataUnitFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's alert message should not be included.",
                status: "allocating",
              }),
            }),
            "calico/2": modelDataUnitFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's blocked message should not be included.",
                status: "lost",
              }),
            }),
          },
        }),
      },
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("blocked");
    expect(status.messages).toStrictEqual([
      {
        appName: "etcd",
        unitId: "etcd/2",
        message: "This unit's blocked message should be included!",
      },
      {
        appName: "calico",
        message: "This app's blocked message should be included!",
      },
    ]);
  });
});
