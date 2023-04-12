import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "store/store";

const slice = (state: RootState) => state.ui;

// ----- Exported functions

export const isUserMenuActive = createSelector(
  [slice],
  (sliceState) => sliceState.userMenuActive
);

export const isConfirmationModalActive = createSelector(
  [slice],
  (sliceState) => sliceState.confirmationModalActive
);

export const isSideNavCollapsed = createSelector(
  [slice],
  (sliceState) => sliceState.sideNavCollapsed
);
