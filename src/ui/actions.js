// Action labels
export const actionsList = {
  userMenuActive: "TOGGLE_USER_MENU",
};

/**
  Persist user menu visibility between page renders
*/
export function userMenuActive(toggle) {
  return {
    type: actionsList.userMenuActive,
    payload: toggle,
  };
}
