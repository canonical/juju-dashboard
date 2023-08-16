import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import { autoBind } from "@canonical/jujulib/dist/api/utils";

import type { Controller } from "store/juju/types";

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L344
export type CrossModelQueryRequest = {
  type: string;
  query: string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L353
export type CrossModelQueryResponse = {
  results: Record<string, any>;
  errors: Record<string, string>;
};

/**
  pinger describes a resource that can be pinged and stopped.
*/
class JIMMV4 {
  static NAME: string;
  static VERSION: number;
  version: number;
  _transport: Transport;
  _info: ConnectionInfo;

  constructor(transport: Transport, info: ConnectionInfo) {
    this._transport = transport;
    this._info = info;
    this.version = 4;

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

  findCrossModelQuery(
    params: CrossModelQueryRequest = { type: "jq", query: "." }
  ): Promise<CrossModelQueryResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "CrossModelQuery",
        version: 4,
        params,
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

JIMMV4.NAME = "JIMM";
JIMMV4.VERSION = 4;
export default JIMMV4;
