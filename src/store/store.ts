import { TSFixMe } from "@canonical/react-components";
import { configureStore } from "@reduxjs/toolkit";

import generalReducer from "app/general";
import checkAuth from "store/middleware/check-auth";
import jujuReducer from "juju/reducer";
import { modelPollerMiddleware } from "store/middleware/model-poller";
import uiReducer from "store/ui";
import { JujuState, GeneralState } from "../types";
import { UIState } from "./ui/types";

const store = configureStore({
  // Order of the middleware is important
  middleware: (getDefaultMiddleware) => [
    checkAuth,
    ...getDefaultMiddleware(),
    modelPollerMiddleware,
  ],
  reducer: {
    general: generalReducer as () => TSFixMe,
    juju: jujuReducer,
    ui: uiReducer,
  },
});

// This can be replaced with the returned store type once each slice has been
// migrated to TypeScript.
export type RootState = {
  general: GeneralState;
  juju: JujuState;
  ui: UIState;
};

export default store;
