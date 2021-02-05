// Action labels
export enum actionsList {
  userMenuActive = "TOGGLE_USER_MENU",
  confirmationModalActive = "TOGGLE_CONFIRMATION_MODAL",
}

export type ActionType = {
  type: actionsList;
  payload: boolean;
};

/**
  Persist user menu visibility between page renders
*/
export function userMenuActive(toggle: boolean): ActionType {
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
