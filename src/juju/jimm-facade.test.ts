import type { ConnectionInfo, Transport } from "@canonical/jujulib";

import { connectionInfoFactory } from "testing/factories/juju/jujulib";

import JIMMV3 from "./jimm-facade";

describe("JIMMV3", () => {
  let transport: Transport;
  let connectionInfo: ConnectionInfo;

  beforeEach(() => {
    transport = {
      write: jest.fn(),
    } as unknown as Transport;
    connectionInfo = connectionInfoFactory.build();
  });

  it("disableControllerUUIDMasking", async () => {
    const jimm = new JIMMV3(transport, connectionInfo);
    jimm.disableControllerUUIDMasking();
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "DisableControllerUUIDMasking",
        version: 3,
        params: {},
      },
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("findAuditEvents", async () => {
    const jimm = new JIMMV3(transport, connectionInfo);
    jimm.findAuditEvents({ "user-tag": "user-eggman@external" });
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "FindAuditEvents",
        version: 3,
        params: { "user-tag": "user-eggman@external" },
      },
      expect.any(Function),
      expect.any(Function)
    );
  });

  it("listControllers", async () => {
    const jimm = new JIMMV3(transport, connectionInfo);
    jimm.listControllers();
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "ListControllers",
        version: 3,
        params: {},
      },
      expect.any(Function),
      expect.any(Function)
    );
  });
});
