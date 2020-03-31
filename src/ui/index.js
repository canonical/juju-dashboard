import produce from "immer";

import { actionsList } from "./actions";

function uiReducer(state = {}, action) {
  return produce(state, draftState => {
    switch (action.type) {
      case actionsList.collapsibleSidebar:
        draftState.collapsibleSidebar = action.payload;
        break;
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
