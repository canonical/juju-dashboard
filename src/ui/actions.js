// Action labels
export const actionsList = {
  collapsibleSidebar: "TOGGLE_COLLAPSIBLE_SIDEBAR",
  userMenuActive: "TOGGLE_USER_MENU"
};

/**
  Toggle collapsible sidebar
*/
export function collapsibleSidebar(toggle) {
  return {
    type: actionsList.collapsibleSidebar,
    payload: toggle
  };
}

/**
  Persist user menu visibility between page renders
*/
export function userMenuActive(toggle) {
  return {
    type: actionsList.userMenuActive,
    payload: toggle
  };
}
