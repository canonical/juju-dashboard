/*
  Redux middleware that gates every request on authentication unless an action
  has been whitelisted.
*/
import { isLoggedIn } from "app/selectors";

const actionWhitelist = [
  "STORE_BAKERY",
  "UPDATE_CONTROLLER_CONNECTION",
  "UPDATE_JUJU_API_INSTANCE",
  "UPDATE_PINGER_INTERVAL_ID",
  "LOG_OUT",
  "CLEAR_MODEL_DATA",
  "STORE_VISIT_URL",
  "TOGGLE_COLLAPSIBLE_SIDEBAR"
];

const thunkWhitelist = [];

function error(name) {
  console.log("unable to perform action:", name, "user not authenticated");
}

export default ({ getState }) => next => async action => {
  const loggedIn = isLoggedIn(getState());
  // If the action is a function then it's probably a thunk.
  if (typeof action === "function") {
    if (thunkWhitelist.includes(action.name) || loggedIn) {
      // Await the next to support async thunks
      await next(action);
      return;
    } else {
      error(action.name);
    }
  } else {
    if (actionWhitelist.includes(action.type) || loggedIn) {
      next(action);
      return;
    } else {
      error(action.type);
    }
  }
};
