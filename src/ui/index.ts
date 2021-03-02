import immerProduce from "immer";
import type { UIState } from "types";

import { actionsList, ActionType } from "./actions";

function uiReducer(
  state: UIState = {
    userMenuActive: false,
    confirmationModalActive: false,
    sideNavCollapsed: false,
  },
  action: ActionType
) {
  return immerProduce(state, (draftState: UIState) => {
    switch (action.type) {
      case actionsList.userMenuActive:
        draftState.userMenuActive = action.payload;
        break;
      case actionsList.confirmationModalActive:
        draftState.confirmationModalActive = action.payload;
        break;
      case actionsList.sideNavCollapsed:
        draftState.sideNavCollapsed = action.payload;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default uiReducer;
