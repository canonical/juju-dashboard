import type { User } from "../auth";

/**
 * Permissions that may be granted on a model.
 */
export enum ModelPermission {
  READ = "read",
  WRITE = "write",
  ADMIN = "admin",
}

export class Model {
  constructor(
    public name: string,
    public owner: User,
  ) {}
}
