import type { User } from "../auth";
import type { Controller } from "../objects";
import { ControllerPermission } from "../objects";

import { GiveAccess } from "./utils/give-access";

const jimmAccess = new Map([
  [ControllerPermission.LOGIN, "loginer"],
  [ControllerPermission.SUPERUSER, "administrator"],
]);

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
