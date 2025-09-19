import type { User } from "../auth";
import type { Model } from "../objects";
import { ModelPermission } from "../objects";

import { GiveAccess } from "./utils/give-access";

const jimmAccess = {
  [ModelPermission.READ]: "reader",
  [ModelPermission.WRITE]: "writer",
  [ModelPermission.ADMIN]: "administrator",
};

/**
 * Give a user access to a model.
 */
export class GiveModelAccess extends GiveAccess<Model> {
  constructor(model: Model, user: User, access: ModelPermission) {
    super(model, user, access, jimmAccess, "model");
  }

  override get entityName(): string {
    return this.entity.qualifiedName;
  }
}
