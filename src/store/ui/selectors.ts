import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "store/store";

const slice = (state: RootState) => state.ui;

export const isConfirmationModalActive = createSelector(
  [slice],
  (sliceState) => sliceState.confirmationModalActive
);
