import type { ConnectionInfo, Transport } from "@canonical/jujulib";
import type {
  Error as JujuError,
  InitiateMigrationResults,
} from "@canonical/jujulib/dist/api/facades/controller/ControllerV12";
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
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L463
export type UpgradeToResult = {
  error?: JujuError;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L458
export type UpgradeToResponse = {
  results: UpgradeToResult[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L1056
export type JobAttemptError = {
  attempt: number;
  at: string;
  error: string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L1067
export type JobDetail = {
  state: string;
  attempt: number;
  max_attempts: number;
  attempted_at?: string;
  finalized_at?: string;
  errors?: JobAttemptError[];
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L1086
export type UpgradeToJobStatus = {
  detail: JobDetail;
  info?: string;
};

// As typed in JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/pkg/api/params/params.go#L932
export type ModelControllerInfo = {
  "model-name": string;
  "model-uuid": string;
  "controller-name": string;
  "controller-uuid": string;
  "upgrade-to-job-status"?: UpgradeToJobStatus;
};

// river job states surfaced by JIMM's upgrade-to job (rivertype.JobState), // spell-checker:disable-line
// grouped into active/finalized states by JIMM:
// https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/internal/jimm/jobs/jobs.go#L21-L32
export enum UpgradeToJobState {
  AVAILABLE = "available",
  PENDING = "pending",
  RUNNING = "running",
  RETRYABLE = "retryable",
  SCHEDULED = "scheduled",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  DISCARDED = "discarded",
}

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
   * @param modelUUIDs UUIDs of the models which will be upgraded.
   * @param targetController Name of controller to migrate the models to.
   *
   * @see {@link https://github.com/canonical/jimm/blob/afb7d6a9c9f726a91f46d19e9daf55e1484e2c2f/internal/jujuapi/jimm.go#L857}
   */
  async upgradeTo(
    modelUUIDs: string[],
    targetController: string,
  ): Promise<UpgradeToResponse> {
    const { promise, resolve, reject } =
      Promise.withResolvers<UpgradeToResponse>();
    const req = {
      type: "JIMM",
      request: "UpgradeTo",
      version: 4,
      params: {
        "model-uuids": modelUUIDs,
        "target-controller-name": targetController,
      },
    };
    this._transport.write(req, resolve, reject);
    return promise;
  }

  /**
   * Get controller info about a model, including any active/recent upgrade-to job status.
   *
   * @param model The model UUID or fully-qualified "owner/name" identifier.
   */
  async modelControllerInfo(model: string): Promise<ModelControllerInfo> {
    const { promise, resolve, reject } =
      Promise.withResolvers<ModelControllerInfo>();
    const req = {
      type: "JIMM",
      request: "ModelControllerInfo",
      version: 4,
      params: {
        model,
      },
    };
    this._transport.write(req, resolve, reject);
    return promise;
  }
}

JIMMV4.NAME = "JIMM";
JIMMV4.VERSION = 4;
export default JIMMV4;
