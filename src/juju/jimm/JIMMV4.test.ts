import type { ConnectionInfo, Transport } from "@canonical/jujulib";

import { connectionInfoFactory } from "testing/factories/juju/jujulib";

import JIMMV4 from "./JIMMV4";

describe("JIMMV4", () => {
  let transport: Transport;
  let connectionInfo: ConnectionInfo;

  beforeEach(() => {
    transport = {
      write: jest.fn(),
    } as unknown as Transport;
    connectionInfo = connectionInfoFactory.build();
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
      expect.any(Function)
    );
  });
});
