import type { JSX, PropsWithChildren } from "react";
import type { Toast } from "react-hot-toast";
import reactHotToast from "react-hot-toast";

import { testId } from "testing/utils";
import type { NotificationSeverity } from "utils/toastNotification";

import { TestId } from "./types";

type Props = {
  toastInstance: Toast;
  type: NotificationSeverity;
  undo?: () => void;
} & PropsWithChildren;

export default function ToastCard({
  children,
  toastInstance,
  type,
  undo,
}: Props): JSX.Element {
  let iconName: null | string = null;
  switch (type) {
    case "positive":
      iconName = "success";
      break;
    case "caution":
      iconName = "warning";
      break;
    case "negative":
      iconName = "error";
      break;
    case "information":
      iconName = "information";
      break;
    default:
      break;
  }

  const handleClose = (id: string): void => {
    reactHotToast.remove(id);
  };

  return (
    <div
      className="toast-card"
      data-type={type}
      role="status"
      aria-live="polite"
      {...testId(TestId.TOAST_CARD)}
    >
      <div className="toast-card__body">
        {iconName && <i className={`p-icon--${iconName}`}>{iconName}</i>}
        <div className="toast-card__message">{children}</div>
        <i
          className="p-icon--close"
          onClick={() => {
            handleClose(toastInstance.id);
          }}
          onKeyUp={() => {
            handleClose(toastInstance.id);
          }}
          role="button"
          tabIndex={0}
        >
          Close
        </i>
      </div>
      {undo && (
        <footer className="toast-card__undo">
          <button
            onClick={() => {
              undo();
              handleClose(toastInstance.id);
            }}
            className="p-button--base"
          >
            Undo
          </button>
        </footer>
      )}
    </div>
  );
}
