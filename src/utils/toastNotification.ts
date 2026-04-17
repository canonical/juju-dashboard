import type { NotificationProps } from "@canonical/react-components";
import type { ToastOptions } from "react-hot-toast";
import toast from "react-hot-toast";

export type NotificationSeverity = NotificationProps["severity"];

/**
 * Create a toast notification using react hot toast.
 * This utility maps values to the correct params and annotates the types.
 */
export const toastNotification = (
  message: React.ReactElement | string,
  severity: NotificationSeverity = "information",
): void => {
  toast(
    message,
    // React Hot Toast doesn't officially support custom toast types, but we manually
    // handle these types in our custom renderer. This might not be necessary once this
    // issue is fixed: https://github.com/timolins/react-hot-toast/issues/29.
    { type: severity } as ToastOptions,
  );
};
