import immerProduce from "immer";
import cloneDeep from "clone-deep";

import { actionsList } from "./actions";

function rootReducer(state = {}, action) {
  return immerProduce(state, (draftState) => {
    switch (action.type) {
      case actionsList.updateControllerConnection:
        const connections = cloneDeep(state.controllerConnections || {});
        connections[action.payload.wsControllerURL] = action.payload.conn;
        draftState.controllerConnections = connections;
        break;
      case actionsList.storeBakery:
        draftState.bakery = action.payload;
        break;
      case actionsList.storeConfig:
        draftState.config = action.payload;
        break;
      case actionsList.storeLoginError:
        draftState.loginError = action.payload;
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
        delete draftState.controllerConnection;
        break;
      case actionsList.updateJujuAPIInstance:
        const jujus = cloneDeep(state.jujus || {});
        jujus[action.payload.wsControllerURL] = action.payload.juju;
        draftState.jujus = jujus;
        break;
      case actionsList.updatePingerIntervalId:
        const intervals = cloneDeep(state.pingerIntervalIds || {});
        intervals[action.payload.wsControllerURL] = action.payload.intervalId;
        draftState.pingerIntervalIds = intervals;
        break;
      default:
        // no default value, fall through.
        break;
    }
  });
}

export default rootReducer;
