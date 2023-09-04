import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import { autoBind } from "@canonical/jujulib/dist/api/utils";

import JIMMV3 from "./JIMMV3";

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L92
export type AuditEvent<P = unknown, E = unknown> = {
  "conversation-id": string;
  errors: Record<string, E> | null;
  "facade-method": string;
  "facade-name": string;
  "facade-version": number;
  "is-response": boolean;
  "message-id": number;
  model: string;
  "object-id": string;
  params: Record<string, P> | null;
  time: string;
  "user-tag": string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L132
export type AuditEvents = {
  events: AuditEvent[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/1da76ed2d8dba741f5880f32c073f85f7d518904/api/params/params.go#L179
export type FindAuditEventsRequest = {
  after?: string;
  before?: string;
  limit?: number;
  method?: string;
  model?: string;
  offset?: number;
  "user-tag"?: string;
};

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

  findAuditEvents(params: FindAuditEventsRequest = {}): Promise<AuditEvents> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "FindAuditEvents",
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
