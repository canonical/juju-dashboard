import produce from "immer";

import { actionsList } from "./actions";

function rootReducer(state = {}, action) {
  return produce(state, draftState => {
    // The below is required because CRA ignores the eslint configuration file
    // during development and adds warnings in the dev console.
    // eslint-disable-next-line default-case
    switch (action.type) {
      case actionsList.updateControllerConnection:
        draftState.controllerConnection = action.payload;
        break;
    }
  });
}

export default rootReducer;
