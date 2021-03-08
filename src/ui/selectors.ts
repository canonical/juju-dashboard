import { ReduxState } from "types";

// ----- Exported functions
export const isUserMenuActive = (state: ReduxState) => state.ui.userMenuActive;

export const isConfirmationModalActive = (state: ReduxState) =>
  state.ui.confirmationModalActive;

export const isSideNavCollapsed = (state: ReduxState) =>
  state.ui.sideNavCollapsed;
