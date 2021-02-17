// Action labels
export enum actionsList {
  userMenuActive = "TOGGLE_USER_MENU",
  confirmationModalActive = "TOGGLE_CONFIRMATION_MODAL",
  togglePanel = "TOGGLE_PANEL",
}

export type ActionType = {
  type: actionsList;
  payload: string | boolean | null;
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

/**
  Display confirmation panel before confirming/dismissing changes
*/
export function confirmationPanelActive(toggle: boolean) {
  return {
    type: actionsList.confirmationModalActive,
    payload: toggle,
  };
}

export function togglePanel(panelId: string) {
  return {
    type: actionsList.togglePanel,
    payload: panelId,
  };
}
