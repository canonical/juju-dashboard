import { createListenerMiddleware } from "@reduxjs/toolkit";

import type { AppDispatch, RootState } from "store/store";

export const listenerMiddleware = createListenerMiddleware<
  RootState,
  AppDispatch
>();
