import immerProduce from "immer";

import { actionsList } from "./actions";

function uiReducer(state = {}, action) {
  return immerProduce(state, (draftState) => {
    switch (action.type) {
      case actionsList.userMenuActive:
        draftState.userMenuActive = action.payload;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default uiReducer;
