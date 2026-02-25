import type { User } from "../auth";
import type { Controller } from "../objects";
import { ControllerPermission } from "../objects";

import { GiveAccess } from "./utils/give-access";

const jimmAccess = {
  // spell-checker:disable-next-line
  [ControllerPermission.ADD_MODEL]: "can_addmodel",
  [ControllerPermission.AUDIT_LOG_VIEWER]: "audit_log_viewer",
  [ControllerPermission.SUPERUSER]: "administrator",
};

/**
 * Give a user access to a controller.
 */
export class GiveControllerAccess extends GiveAccess<Controller> {
  constructor(
    controller: Controller,
    user: User,
    access: ControllerPermission,
  ) {
    super(controller, user, access, jimmAccess, "controller");
  }
}
