// Action labels
export const actionsList = {
  userMenuActive: "TOGGLE_USER_MENU",
  confirmationModalActive: "TOGGLE_CONFIRMATION_Modal",
};

/**
  Persist user menu visibility between page renders
*/
export function userMenuActive(toggle: boolean) {
  return {
    type: actionsList.userMenuActive,
    payload: toggle,
  };
}

export function confirmationPanelActive(toggle: boolean) {
  return {
    type: actionsList.confirmationModalActive,
    payload: toggle,
  };
}
