import type { Config } from "juju/api";
import {
  listSecretResultFactory,
  secretAccessInfoFactory,
} from "testing/factories/juju/juju";

import { getRequiredGrants } from "./utils";

describe("getRequiredGrants", () => {
  const config: Config = {
    username: {
      name: "username",
      default: "eggman",
      description: "a username",
      source: "default",
      type: "string",
      value: "eggmant1",
      newValue: "secret:aabbccdd",
    },
    email: {
      name: "email",
      default: "eggman@example.com",
      description: "an email",
      source: "default",
      type: "string",
      value: "eggman1@example.com",
      newValue: "secret:eeffgghh",
    },
  };

  it("returns a list of secrets", async () => {
    const secrets = [
      listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
      listSecretResultFactory.build({ access: [], uri: "secret:eeffgghh" }),
    ];
    expect(getRequiredGrants("etcd", config, secrets)).toStrictEqual([
      "secret:aabbccdd",
      "secret:eeffgghh",
    ]);
  });

  it("does not include already granted secrets", async () => {
    const secrets = [
      listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
      listSecretResultFactory.build({
        access: [
          secretAccessInfoFactory.build({ "target-tag": "application-etcd" }),
        ],
        uri: "secret:eeffgghh",
      }),
    ];
    expect(getRequiredGrants("etcd", config, secrets)).toStrictEqual([
      "secret:aabbccdd",
    ]);
  });

  it("does not include same secret more than once", async () => {
    config.email.newValue = "secret:aabbccdd";
    const secrets = [
      listSecretResultFactory.build({ access: [], uri: "secret:aabbccdd" }),
      listSecretResultFactory.build({ access: [], uri: "secret:eeffgghh" }),
    ];
    expect(getRequiredGrants("etcd", config, secrets)).toStrictEqual([
      "secret:aabbccdd",
    ]);
  });

  it("does not include app-owned secrets", async () => {
    const secrets = [
      listSecretResultFactory.build({
        access: [],
        uri: "secret:aabbccdd",
      }),
      listSecretResultFactory.build({
        access: [],
        uri: "secret:eeffgghh",
        "owner-tag": "application-etcd",
      }),
    ];
    expect(getRequiredGrants("etcd", config, secrets)).toStrictEqual([
      "secret:aabbccdd",
    ]);
  });
});
