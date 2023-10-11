import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import { autoBind } from "@canonical/jujulib/dist/api/utils";

import JIMMV3 from "./JIMMV3";

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L344
export type CrossModelQueryRequest = {
  type: string;
  query: string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L353
export type CrossModelQueryResponse = {
  results: Record<string, unknown[]>;
  errors: Record<string, string[]>;
};

// In the case an invalid type and/or query is passed, the response might
// sometimes be a string.
export type CrossModelQueryFullResponse = CrossModelQueryResponse | string;

export enum JIMMRelation {
  AUDIT_LOG_VIEWER = "audit_log_viewer",
  ADMINISTRATOR = "administrator",
}

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c1e1642ac701bcbef2fdd8f4e347de9dcf16ac50/api/params/params.go#L296
export type RelationshipTuple = {
  object: string;
  relation: JIMMRelation | string;
  target_object: string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c1e1642ac701bcbef2fdd8f4e347de9dcf16ac50/api/params/params.go#L324
export type CheckRelationResponse =
  | {
      allowed: boolean;
    }
  | string;

export const isCrossModelQueryResponse = (
  response: CrossModelQueryFullResponse
): response is CrossModelQueryResponse =>
  typeof response === "object" && "results" in response && "errors" in response;

class JIMMV4 extends JIMMV3 {
  static NAME: string;
  static VERSION: number;
  version: number;
  _transport: Transport;
  _info: ConnectionInfo;

  constructor(transport: Transport, info: ConnectionInfo) {
    super(transport, info);
    this._transport = transport;
    this._info = info;
    this.version = 4;

    // Automatically bind all methods to instances.
    autoBind(this);
  }

  checkRelation(tuple: RelationshipTuple): Promise<CheckRelationResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "CheckRelation",
        version: 4,
        params: { tuple },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  crossModelQuery(query: string): Promise<CrossModelQueryFullResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "CrossModelQuery",
        version: 4,
        params: { type: "jq", query }, // API currently only supports "jq" type.
      };
      this._transport.write(req, resolve, reject);
    });
  }
}

JIMMV4.NAME = "JIMM";
JIMMV4.VERSION = 4;
export default JIMMV4;
