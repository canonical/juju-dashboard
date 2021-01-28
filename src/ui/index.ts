import immerProduce from "immer";
import type { UIState } from "types";

import { actionsList } from "./actions";

type UIStateAction = {
  // XXX Look into converting `type` to ENUM with the values from actionList.
  type: string;
  payload: boolean;
};

function uiReducer(
  state: UIState = {
    userMenuActive: false,
    confirmationModalActive: false,
  },
  action: UIStateAction
) {
  return immerProduce(state, (draftState: UIState) => {
    switch (action.type) {
      case actionsList.userMenuActive:
        draftState.userMenuActive = action.payload;
        break;
      case actionsList.confirmationModalActive:
        draftState.confirmationModalActive = action.payload;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default uiReducer;
