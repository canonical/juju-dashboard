import immerProduce from "immer";
import cloneDeep from "clone-deep";

import { actionsList } from "./action-types";

function generalReducer(state = {}, action) {
  return immerProduce(state, (draftState) => {
    switch (action.type) {
      case actionsList.updateControllerConnection:
        const connections = cloneDeep(state.controllerConnections || {});
        connections[action.payload.wsControllerURL] = action.payload.info;
        draftState.controllerConnections = connections;
        break;
      case actionsList.storeConfig:
        draftState.config = action.payload;
        break;
      case actionsList.storeLoginError:
        draftState.loginError = action.payload;
        break;
      case actionsList.storeUserPass:
        const credentials = cloneDeep(state.credentials || {});
        credentials[action.payload.wsControllerURL] = action.payload.credential;
        draftState.credentials = credentials;
        break;
      case actionsList.storeVersion:
        draftState.appVersion = action.payload;
        break;
      case actionsList.storeVisitURL:
        draftState.visitURL = action.payload;
        break;
      case actionsList.logOut:
        delete draftState.controllerConnections;
        delete draftState.visitURL;
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

export default generalReducer;
