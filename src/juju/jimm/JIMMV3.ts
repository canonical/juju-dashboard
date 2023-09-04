import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import { autoBind } from "@canonical/jujulib/dist/api/utils";

import type { Controller } from "store/juju/types";

class JIMMV3 {
  static NAME: string;
  static VERSION: number;
  version: number;
  _transport: Transport;
  _info: ConnectionInfo;

  constructor(transport: Transport, info: ConnectionInfo) {
    this._transport = transport;
    this._info = info;
    this.version = 3;

    // Automatically bind all methods to instances.
    autoBind(this);
  }

  disableControllerUUIDMasking() {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "DisableControllerUUIDMasking",
        version: 3,
        params: {},
      };
      this._transport.write(req, resolve, reject);
    });
  }

  listControllers(): Promise<{ controllers: Controller[] }> {
    return new Promise((resolve, reject) => {
      const params = {};
      const req = {
        type: "JIMM",
        request: "ListControllers",
        version: 3,
        params: params,
      };
      this._transport.write(req, resolve, reject);
    });
  }
}

JIMMV3.NAME = "JIMM";
JIMMV3.VERSION = 3;
export default JIMMV3;
