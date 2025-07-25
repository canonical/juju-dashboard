import reactHotToast from "react-hot-toast";

import ToastCard from "components/ToastCard";

export function sendToast(message: string) {
  reactHotToast.custom((toast) => (
    <ToastCard type="positive" toastInstance={toast}>
      {message}
    </ToastCard>
  ));
}
