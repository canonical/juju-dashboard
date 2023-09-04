import type { ConnectionInfo, Transport } from "@canonical/jujulib";

import JIMMV3 from "./JIMMV3";

describe("JIMMV3", () => {
  let transport: Transport;
  let connectionInfo: ConnectionInfo;

  beforeEach(() => {
    transport = {
      write: jest.fn(),
    } as unknown as Transport;
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

  it("crossModelQuery", async () => {
    const jimm = new JIMMV3(transport, connectionInfo);
    jimm.crossModelQuery(".");
    expect(transport.write).toHaveBeenCalledWith(
      {
        type: "JIMM",
        request: "CrossModelQuery",
        version: 4,
        params: { type: "jq", query: "." },
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
