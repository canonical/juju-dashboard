import produce from "immer";

import { actionsList } from "./actions";

function rootReducer(state = {}, action) {
  return produce(state, draftState => {
    switch (action.type) {
      case actionsList.updateControllerConnection:
        draftState.controllerConnection = action.payload;
        break;
      case actionsList.storeBakery:
        draftState.bakery = action.payload;
        break;
      case actionsList.storeVisitURL:
        draftState.visitURL = action.payload;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default rootReducer;
