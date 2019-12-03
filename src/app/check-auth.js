/*
  Redux middleware that gates every request on authentication unless an action
  has been whitelisted.
*/
import { isLoggedIn } from "app/selectors";

const whitelist = [
  "STORE_BAKERY",
  "UPDATE_CONTROLLER_CONNECTION",
  "UPDATE_JUJU_API_INSTANCE",
  "UPDATE_PINGER_INTERVAL_ID",
  "LOG_OUT",
  "CLEAR_MODEL_DATA",
  "STORE_VISIT_URL",
  "TOGGLE_COLLAPSIBLE_SIDEBAR"
];

export default ({ getState }) => next => action => {
  if (whitelist.includes(action.type)) {
    next(action);
    return;
  }
  if (isLoggedIn(getState())) {
    next(action);
  } else {
    console.log(
      "unable to perform action:",
      action.type,
      "user not authenticated"
    );
  }
};
