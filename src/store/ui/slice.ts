import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "ui",
  initialState: {
    userMenuActive: false,
    confirmationModalActive: false,
    sideNavCollapsed: false,
  },
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
