import type { ConnectionInfo, Transport } from "@canonical/jujulib";

import { relationshipTupleFactory } from "testing/factories/juju/juju";
import { connectionInfoFactory } from "testing/factories/juju/jujulib";

import JIMMV4, { JIMMRelation } from "./JIMMV4";

describe("JIMMV4", () => {
  let transport: Transport;
  let connectionInfo: ConnectionInfo;

  beforeEach(() => {
    transport = {
      write: vi.fn(),
    } as unknown as Transport;
    connectionInfo = connectionInfoFactory.build();
  });

  it("checkRelation", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    const params = {
      object: "user-eggman@external",
      relation: JIMMRelation.MEMBER,
      target_object: "group-administrators",
    };
    void jimm.checkRelation(params);
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "CheckRelation",
        version: 4,
        params: {
          tuple: params,
        },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("crossModelQuery", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.crossModelQuery(".");
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "CrossModelQuery",
        version: 4,
        params: { type: "jq", query: "." },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("disableControllerUUIDMasking", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.disableControllerUUIDMasking();
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "DisableControllerUUIDMasking",
        version: 4,
        params: {},
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("findAuditEvents", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.findAuditEvents({ "user-tag": "user-eggman@external" });
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "FindAuditEvents",
        version: 4,
        params: { "user-tag": "user-eggman@external" },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("listControllers", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.listControllers();
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "ListControllers",
        version: 4,
        params: {},
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("checkRelations", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    const tuples = [
      relationshipTupleFactory.build(),
      relationshipTupleFactory.build(),
    ];
    void jimm.checkRelations(tuples);
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "CheckRelations",
        version: 4,
        params: {
          tuples,
        },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("migrateModel", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.migrateModel([
      { "model-tag": "my-model", "target-controller": "target" },
    ]);
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "MigrateModel",
        version: 4,
        params: {
          specs: [{ "model-tag": "my-model", "target-controller": "target" }],
        },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });

  it("listMigrationTargets", async () => {
    const jimm = new JIMMV4(transport, connectionInfo);
    void jimm.listMigrationTargets("my-model");
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "ListMigrationTargets",
        version: 4,
        params: {
          "model-tag": "my-model",
        },
      },
      expect.any(Function),
      expect.any(Function),
    );
  });
});
