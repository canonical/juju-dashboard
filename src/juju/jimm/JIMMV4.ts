import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import type { InitiateMigrationResults } from "@canonical/jujulib/dist/api/facades/controller/ControllerV12";
import { autoBind } from "@canonical/jujulib/dist/api/utils";

import JIMMV3, { type ControllerInfo } from "./JIMMV3";

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

// As typed in JIMM
// https://github.com/canonical/jimm/blob/v3/internal/jimmhttp/rebac_admin/entitlements.go
export enum JIMMRelation {
  ADMINISTRATOR = "administrator",
  AUDIT_LOG_VIEWER = "audit_log_viewer",
  CAN_ADDMODEL = "can_addmodel", // spell-checker:disable-line
  CONSUMER = "consumer",
  MEMBER = "member",
  READER = "reader",
  WRITER = "writer",
}

export enum JIMMTarget {
  JIMM_CONTROLLER = "controller-jimm",
}

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c1e1642ac701bcbef2fdd8f4e347de9dcf16ac50/api/params/params.go#L296
export type RelationshipTuple = {
  object: string;
  relation: JIMMRelation;
  target_object: JIMMTarget | string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c1e1642ac701bcbef2fdd8f4e347de9dcf16ac50/api/params/params.go#L324
export type CheckRelationResponse =
  | {
      allowed: boolean;
    }
  | { error: string };

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/f99b1498267dcb551b640c5b389657aa4cf7f798/pkg/api/params/params.go#L372
export type CheckRelationsResponse = {
  results: CheckRelationResponse[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c82e0cbba03387031a46ec3a48494803dce16995/pkg/api/params/params.go#L482
export type MigrateModelInfo = {
  "model-tag": string;
  "target-controller": string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/c82e0cbba03387031a46ec3a48494803dce16995/pkg/api/params/params.go#L217
export type ListControllersResponse = {
  controllers: ControllerInfo[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/009a969009c1b7d37f9336837664f0f53af3ea9e/pkg/api/params/params.go#L764
export type VersionElem = {
  version: string;
  date: string;
  "link-to-release": string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/009a969009c1b7d37f9336837664f0f53af3ea9e/pkg/api/params/params.go#L774
export type SupportedJujuVersionsResponse = {
  versions: VersionElem[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/4434cb03a24b96c493e861d3dd990c1ff37fff3b/pkg/api/params/params.go#L394
export type UpgradeToResponse = {
  success: boolean;
  "job-id": number;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/4434cb03a24b96c493e861d3dd990c1ff37fff3b/pkg/api/params/params.go#L733
export enum JobStatus {
  RUNNING = "running",
  SUCCESSFUL = "successful",
  PENDING = "pending",
  FAILED = "failed",
  UNKNOWN = "unknown",
}

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/4434cb03a24b96c493e861d3dd990c1ff37fff3b/pkg/api/params/params.go#L845
export type JobInfoResponse = {
  id: number;
  status: JobStatus;
  kind: string;
  current_attempt: number;
  max_attempts: number;
  finished_at?: string;
  errors?: string;
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

  async checkRelation(
    tuple: RelationshipTuple,
  ): Promise<CheckRelationResponse> {
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

  async checkRelations(
    tuples: RelationshipTuple[],
  ): Promise<CheckRelationsResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "CheckRelations",
        version: 4,
        params: { tuples },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  async crossModelQuery(query: string): Promise<CrossModelQueryResponse> {
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

  async migrateModel(
    specs: MigrateModelInfo[],
  ): Promise<InitiateMigrationResults> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "MigrateModel",
        version: 4,
        params: { specs },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  async listMigrationTargets(
    modelTag: string,
  ): Promise<ListControllersResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "ListMigrationTargets",
        version: 4,
        params: {
          "model-tag": modelTag,
        },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  /**
   * Return the list of Juju versions supported by JIMM for bootstrapping new controllers.
   *
   * @param minVersion Optional lower bound version filter, versions less than or equal to
   * will be excluded.
   *
   * @see {@link https://github.com/canonical/jimm/blob/009a969009c1b7d37f9336837664f0f53af3ea9e/internal/jujuapi/jimm.go#L848}
   */
  async supportedJujuVersions(
    minVersion?: string,
  ): Promise<SupportedJujuVersionsResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "SupportedJujuVersions",
        version: 4,
        params: {
          "min-version": minVersion,
        },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  /**
   * Initiate a model upgrade.
   *
   * @param modelTag Tag of the model which will be upgraded.
   * @param targetController Name of controller to migrate the model to.
   *
   * @see {@link https://github.com/canonical/jimm/blob/53c606aa41ae6339c7b6cf430c7051bf489b9238/internal/jujuapi/jimm.go#L738}
   */
  async upgradeTo(
    modelTag: string,
    targetController: string,
  ): Promise<UpgradeToResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "UpgradeTo",
        version: 4,
        params: {
          "model-tag": modelTag,
          "target-controller-name": targetController,
        },
      };
      this._transport.write(req, resolve, reject);
    });
  }

  /**
   * Get info about a job.
   *
   * @param jobId The id of a job.
   *
   * @see {@link https://github.com/canonical/jimm/blob/4434cb03a24b96c493e861d3dd990c1ff37fff3b/pkg/api/client.go#L406}
   */
  async jobInfo(jobId: string): Promise<JobInfoResponse> {
    return new Promise((resolve, reject) => {
      const req = {
        type: "JIMM",
        request: "JobInfo",
        version: 4,
        params: {
          "job-id": jobId,
        },
      };
      this._transport.write(req, resolve, reject);
    });
  }
}

JIMMV4.NAME = "JIMM";
JIMMV4.VERSION = 4;
export default JIMMV4;
