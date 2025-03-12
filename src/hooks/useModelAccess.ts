import { useGetRelationships } from "juju/api-hooks/permissions";
import type { RelationshipTuple } from "juju/jimm/JIMMV4";
import { JIMMRelation } from "juju/jimm/JIMMV4";
import { getIsJuju, getControllerUserTag } from "store/general/selectors";
import { getModelAccess } from "store/juju/selectors";
import { useAppSelector } from "store/store";

// A user can only have 'administrator', 'writer' or reader' entitlements to a model. See:
// https://github.com/canonical/jimm/blob/197f97f212fa9b8eb9977dd33650b87d10492ca5/internal/jimmhttp/rebac_admin/entitlements.go#L63-L75
const order = [
  JIMMRelation.READER,
  JIMMRelation.WRITER,
  JIMMRelation.ADMINISTRATOR,
];

// Theoretically this array should only contain a single item with
// 'administrator', 'writer' or reader', but this orders the items to be safe
// and will handle new/unrelated entitlements if they're added in the future.
const getHighestAccess = (relations: RelationshipTuple[]) => {
  if (!relations.length) {
    return null;
  }
  return relations.reduce<JIMMRelation>(
    (highest, tuple) =>
      order.indexOf(tuple.relation) > order.indexOf(highest)
        ? tuple.relation
        : highest,
    // Set the initial value to the first relation.
    relations[0].relation,
  );
};

const useModelAccess = (modelUUID?: string | null, cleanup?: boolean) => {
  const isJuju = useAppSelector(getIsJuju);
  const controllerUser = useAppSelector(getControllerUserTag);
  const jujuAccess = useAppSelector((state) =>
    getModelAccess(state, modelUUID),
  );
  const { relationships } = useGetRelationships(
    !isJuju && controllerUser && modelUUID
      ? {
          object: controllerUser,
          target_object: `model-${modelUUID}`,
        }
      : null,
    cleanup,
  );
  if (isJuju) {
    return jujuAccess;
  }
  return relationships?.length ? getHighestAccess(relationships) : null;
};

export default useModelAccess;
