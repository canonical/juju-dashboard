// Action labels
export const actionsList = {
  collapsibleSidebar: "TOGGLE_COLLAPSIBLE_SIDEBAR",
  userMenuActive: "TOGGLE_USER_MENU",
  externalNavActive: "TOGGLE_EXTERNAL_NAV",
};

/**
  Toggle collapsible sidebar
*/
export function collapsibleSidebar(toggle) {
  return {
    type: actionsList.collapsibleSidebar,
    payload: toggle,
  };
}

/**
  Persist user menu visibility between page renders
*/
export function userMenuActive(toggle) {
  return {
    type: actionsList.userMenuActive,
    payload: toggle,
  };
}

/**
  Persist external navigation visibility between page renders
*/
export function externalNavActive(toggle) {
  return {
    type: actionsList.externalNavActive,
    payload: toggle,
  };
}
