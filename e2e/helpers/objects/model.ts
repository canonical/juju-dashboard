import type { User } from "../auth";

/**
 * Permissions that may be granted on a model.
 */
export enum ModelGrantPermission {
  Read = "read",
  Write = "write",
  Admin = "admin",
}

export class Model {
  constructor(
    public name: string,
    public owner: User,
  ) {}
}
