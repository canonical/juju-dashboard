/* eslint-disable default-case */
// immer handles the default case so one isn't needed.
import produce from "immer";

import { actionsList } from "./actions";

function rootReducer(state = {}, action) {
  return produce(state, draftState => {
    switch (action.type) {
      case actionsList.updateControllerConnection:
        draftState.controllerConnection = action.payload;
        break;
    }
  });
}

export default rootReducer;
