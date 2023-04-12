import { createSlice } from "@reduxjs/toolkit";

import type { UIState } from "./types";

const slice = createSlice({
  name: "ui",
  initialState: {
    userMenuActive: false,
    confirmationModalActive: false,
    sideNavCollapsed: false,
  } as UIState,
  reducers: {
    userMenuActive: (state, action) => {
      state.userMenuActive = action.payload;
    },
    confirmationModalActive: (state, action) => {
      state.confirmationModalActive = action.payload;
    },
    sideNavCollapsed: (state, action) => {
      state.sideNavCollapsed = action.payload;
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
