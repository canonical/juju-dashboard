import { ReduxState } from "types";

// ----- Exported functions
export const isUserMenuActive = (state: ReduxState) => state.ui.userMenuActive;

export const isConfirmationModalActive = (state: ReduxState) =>
  state.ui.confirmationModalActive;

export const togglePanel = (state: ReduxState) => state.ui.togglePanel;
