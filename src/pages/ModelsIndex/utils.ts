import { DestroyBlockedReason, type ModelData } from "store/juju/types";

export const getDestroyBlockedReason = (
  data: ModelData,
  canConfigure?: boolean,
): DestroyBlockedReason | null => {
  let destroyBlockedReason = null;
  if (data?.info?.["is-controller"]) {
    destroyBlockedReason = DestroyBlockedReason.IS_CONTROLLER;
  } else if (!canConfigure) {
    destroyBlockedReason = DestroyBlockedReason.NO_ACCESS;
  } else if (
    Object.values(data?.offers ?? {}).some(
      (offer) => offer["total-connected-count"] > 0,
    )
  ) {
    destroyBlockedReason = DestroyBlockedReason.CONNECTED_OFFERS;
  }
  return destroyBlockedReason;
};
