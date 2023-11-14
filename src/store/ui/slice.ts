import { createSlice } from "@reduxjs/toolkit";

import type { UIState } from "./types";

const slice = createSlice({
  name: "ui",
  initialState: {
    confirmationModalActive: false,
  } as UIState,
  reducers: {
    confirmationModalActive: (state, action) => {
      state.confirmationModalActive = action.payload;
    },
  },
});

export const { actions, reducer } = slice;

export default reducer;
