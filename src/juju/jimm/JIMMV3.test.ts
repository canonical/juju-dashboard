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
    void jimm.disableControllerUUIDMasking();
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

  it("listControllers", async () => {
    const jimm = new JIMMV3(transport, connectionInfo);
    void jimm.listControllers();
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
