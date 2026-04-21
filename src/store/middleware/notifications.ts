import type { Middleware } from "redux";

import { createToast } from "store/app/actions";
import type { RootState, Store } from "store/store";
import { toastNotification } from "utils/toastNotification";

/**
  Redux middleware to catch `createToast` actions and display a toast.
*/
export const notificationsMiddleware: Middleware<
  void,
  RootState,
  Store["dispatch"]
> = () => (next) => (action) => {
  if (createToast.match(action)) {
    toastNotification(action.payload.message, action.payload.severity);
    // Don't need to pass this notifications on to other middleware.
    return;
  }
  return next(action);
};

export default notificationsMiddleware;
