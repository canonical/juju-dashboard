import type { User } from "../auth";

/**
 * Permissions that may be granted on a controller.
 */
export enum ControllerPermission {
  ADD_MODEL = "add-model",
  AUDIT_LOG_VIEWER = "audit-log-viewer",
  SUPERUSER = "superuser",
}

export class Controller {
  constructor(
    public name: string,
    public owner: User,
  ) {}
}
