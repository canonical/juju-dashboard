import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import {
  applicationStatusFactory,
  detailedStatusFactory,
  modelStatusInfoFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory as modelManagerV10modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelInfoFactory as modelManagerV11modelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import { modelDataFactory } from "testing/factories/juju/juju";

import {
  canAdministerModel,
  extractCredentialName,
  generateIconPath,
  pluralize,
  getModelStatusGroupData,
  getModelQualifier,
} from "./models";

describe("getModelQualifier", () => {
  it("gets the qualifier", () => {
    const modelInfo = modelManagerV11modelInfoFactory.build({
      qualifier: "eggman@external",
    });
    expect(getModelQualifier(modelInfo)).toBe("eggman@external");
  });

  it("gets the owner", () => {
    const modelInfo = modelManagerV10modelInfoFactory.build({
      "owner-tag": "user-eggman@external",
    });
    expect(getModelQualifier(modelInfo)).toBe("eggman@external");
  });
});

describe("extractCredentialName", () => {
  it.for([null, undefined, ""] as const)(
    "returns placeholders if the tag is %j",
    (tag, { expect }) => {
      expect(extractCredentialName(tag)).toStrictEqual({
        cloud: "-",
        user: "-",
        name: "-",
      });
    },
  );

  it("splits a tag into the cloud, user and credential", () => {
    expect(extractCredentialName("cloudcred-aws_admin_default")).toStrictEqual({
      cloud: "aws",
      user: "admin",
      name: "default",
    });
  });

  it("handles external users", () => {
    expect(
      extractCredentialName("cloudcred-google_eggman@external_juju"),
    ).toStrictEqual({ cloud: "google", user: "eggman@external", name: "juju" });
  });

  it("handles underscores in the name of an external user", () => {
    expect(
      extractCredentialName("cloudcred-aws_egg_man@external_aws-cred"),
    ).toStrictEqual({
      cloud: "aws",
      user: "egg_man@external",
      name: "aws-cred",
    });
  });

  it("handles underscores in the credential name of an external user", () => {
    expect(
      extractCredentialName("cloudcred-aws_eggman@external_my_cred"),
    ).toStrictEqual({
      cloud: "aws",
      user: "eggman@external",
      name: "my_cred",
    });
  });

  it("handles underscores in the credential name of a local user", () => {
    expect(extractCredentialName("cloudcred-aws_admin_my_cred")).toStrictEqual({
      cloud: "aws",
      user: "admin",
      name: "my_cred",
    });
  });

  it.for([
    "cloudcred-aws",
    "cloudcred-aws_admin",
    "cloudcred-aws_admin_",
    "cloudcred-aws_eggman@external",
    "cloudcred-aws_eggman@external_",
    "cloudcred-@external_name",
    "cloudcred-aws_@external_name",
  ])("returns placeholders for the malformed tag %j", (tag, { expect }) => {
    expect(extractCredentialName(tag)).toStrictEqual({
      cloud: "-",
      user: "-",
      name: "-",
    });
  });
});

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
  it("should return an icon URI for a promulgated charm", () => {
    const charmId = "cs:mysql-12";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/mysql/icon");
  });

  it("should return an icon URI for a promulgated charm with dash", () => {
    const charmId = "cs:hadoop-client-12";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/hadoop-client/icon");
  });

  it("should return an icon URI for a none promulgated charm", () => {
    const charmId = "cs:~containers/kubernetes-master-1106";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe(
      "https://charmhub.io/containers-kubernetes-master/icon",
    );
  });

  it("should return an icon URI for a none promulgated charm with release", () => {
    // spell-checker:disable-next-line
    const charmId = "cs:~hatch/precise/failtester-7";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/hatch-failtester/icon");
  });

  it("should return default charm icon if the charm is local", () => {
    const charmId = "local:my-charm";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe(defaultCharmIcon);
  });

  it("should return an icon URI for a charmhub charm path", () => {
    const charmId = "ch:content-cache-425";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/content-cache/icon");
  });

  it("should return an icon URI for a charmhub charm path with architecture", () => {
    const charmId = "ch:amd64/content-cache-425";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/content-cache/icon");
  });

  it("should return an icon URI for a charmhub charm path with architecture and series", () => {
    const charmId = "ch:amd64/xenial/content-cache-425";
    const iconPath = generateIconPath(charmId);
    expect(iconPath).toBe("https://charmhub.io/content-cache/icon");
  });
});

describe("getModelStatusGroupData", () => {
  it("should handle 'running' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "running" }),
        }),
      },
      model: modelStatusInfoFactory.build({ "cloud-tag": "cloud-aws" }),
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("running");
  });

  it("should handle 'alert' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "running" }),
        }),
        etcd: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "unknown" }),
        }),
      },
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("alert");
  });

  it("should handle 'blocked' as the highest status", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "running" }),
        }),
        etcd: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "unknown" }),
        }),
        calico: applicationStatusFactory.build({
          status: detailedStatusFactory.build({ status: "blocked" }),
        }),
      },
    });
    const status = getModelStatusGroupData(modelData);
    expect(status.highestStatus).toBe("blocked");
  });

  it("should add messages for 'blocked' apps and units", () => {
    const modelData = modelDataFactory.build({
      applications: {
        easyrsa: applicationStatusFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's running message should not be included.",
            status: "running",
          }),
        }),
        etcd: applicationStatusFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's alert app message should not be included.",
            status: "unknown",
          }),
          units: {
            "etcd/2": unitStatusFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's blocked message should be included!",
                status: "lost",
              }),
            }),
          },
        }),
        calico: applicationStatusFactory.build({
          status: detailedStatusFactory.build({
            info: "This app's blocked message should be included!",
            status: "blocked",
          }),
          units: {
            "calico/0": unitStatusFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's running message should not be included.",
                status: "available",
              }),
            }),
            "calico/1": unitStatusFactory.build({
              "agent-status": detailedStatusFactory.build({
                info: "This unit's alert message should not be included.",
                status: "allocating",
              }),
            }),
            "calico/2": unitStatusFactory.build({
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
