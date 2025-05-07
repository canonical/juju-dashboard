import type { User } from "../auth";

/**
 * Permissions that may be granted on a controller.
 */
export enum ControllerPermission {
  LOGIN = "login",
  SUPERUSER = "superuser",
}

/**
 * Relations that may be given if the target is a controller.
 */
export enum ControllerTargetRelations {
  LOGINER = "loginer",
  ADMINISTRATOR = "administrator",
}

export class Controller {
  constructor(
    public name: string,
    public owner: User,
  ) {}
}
