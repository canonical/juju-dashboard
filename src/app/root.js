import produce from "immer";

import { actionsList } from "./actions";

function rootReducer(state = {}, action) {
  return produce(state, (draftState) => {
    switch (action.type) {
      case actionsList.updateControllerConnection:
        draftState.controllerConnection = action.payload;
        break;
      case actionsList.storeBakery:
        draftState.bakery = action.payload;
        break;
      case actionsList.storeConfig:
        draftState.config = action.payload;
        break;
      case actionsList.storeUserPass:
        draftState.credentials = action.payload;
        break;
      case actionsList.storeVersion:
        draftState.appVersion = action.payload;
        break;
      case actionsList.storeVisitURL:
        draftState.visitURL = action.payload;
        break;
      case actionsList.logOut:
        delete draftState.bakery.storage._store.identity;
        break;
      case actionsList.updateJujuAPIInstance:
        draftState.juju = action.payload;
        break;
      case actionsList.updatePingerIntervalId:
        draftState.pingerIntervalId = action.payload;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default rootReducer;
