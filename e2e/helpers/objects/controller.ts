import type { User } from "../auth";

/**
 * Permissions that may be granted on a controller.
 */
export enum ControllerPermission {
  LOGIN = "login",
  SUPERUSER = "superuser",
}

export class Controller {
  constructor(
    public name: string,
    public owner: User,
  ) {}
}
