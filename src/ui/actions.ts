// Action labels
export enum actionsList {
  userMenuActive = "TOGGLE_USER_MENU",
  confirmationModalActive = "TOGGLE_CONFIRMATION_MODAL",
  sideNavCollapsed = "SIDENAV_COLLAPSED",
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

/**
  Display confirmation panel before confirming/dismissing changes
*/
export function confirmationPanelActive(toggle: boolean) {
  return {
    type: actionsList.confirmationModalActive,
    payload: toggle,
  };
}

/**
  Persist collapse state of sidenav between renders
*/
export function sideNavCollapsed(toggle: boolean) {
  return {
    type: actionsList.sideNavCollapsed,
    payload: toggle,
  };
}
