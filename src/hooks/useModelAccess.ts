import { useId } from "react";

import { useCheckRelations } from "juju/api-hooks/permissions";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import {
  getIsJuju,
  getControllerUserTag,
  getIsJIMM,
} from "store/general/selectors";
import { getModelAccess, getReBACPermissions } from "store/juju/selectors";
import type { ReBACAllowed } from "store/juju/types";
import { useAppSelector } from "store/store";

// A user can only have 'administrator', 'writer' or reader' entitlements to a model. See:
// https://github.com/canonical/jimm/blob/197f97f212fa9b8eb9977dd33650b87d10492ca5/internal/jimmhttp/rebac_admin/entitlements.go#L63-L75
const order = [
  JIMMRelation.READER,
  JIMMRelation.WRITER,
  JIMMRelation.ADMINISTRATOR,
];

const getHighestAccess = (relations: ReBACAllowed[]) => {
  if (!relations.length) {
    return null;
  }
  return relations.reduce<JIMMRelation>(
    (highest, { tuple }) =>
      order.indexOf(tuple.relation) > order.indexOf(highest)
        ? tuple.relation
        : highest,
    // Set the initial value to the first relation.
    relations[0].tuple.relation,
  );
};

const useModelAccess = (
  modelUUID: null | string = null,
  cleanup: boolean = false,
) => {
  const isJuju = useAppSelector(getIsJuju);
  const isJIMM = useAppSelector(getIsJIMM);
  const controllerUser = useAppSelector(getControllerUserTag);
  const jujuAccess = useAppSelector((state) =>
    getModelAccess(state, modelUUID),
  );
  const relations =
    isJIMM &&
    controllerUser !== null &&
    controllerUser &&
    modelUUID !== null &&
    modelUUID
      ? [
          {
            object: controllerUser,
            relation: JIMMRelation.ADMINISTRATOR,
            target_object: `model-${modelUUID}`,
          },
          {
            object: controllerUser,
            relation: JIMMRelation.WRITER,
            target_object: `model-${modelUUID}`,
          },
          {
            object: controllerUser,
            relation: JIMMRelation.READER,
            target_object: `model-${modelUUID}`,
          },
        ]
      : null;
  const permissions = useAppSelector((state) =>
    getReBACPermissions(state, relations),
  );
  // Each place the relations are checked needs to use a unique ID. The useId
  // hook should return an ID that is unique across the app, but this may need to
  // be replaced with a more robust implementation if there are conflicts.
  const requestId = useId();
  useCheckRelations(requestId, relations, cleanup);
  if (isJuju) {
    return jujuAccess;
  }
  return getHighestAccess(permissions ?? []);
};

export default useModelAccess;
