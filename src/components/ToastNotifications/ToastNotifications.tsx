import type { FC } from "react";
import type { DefaultToastOptions } from "react-hot-toast";
import { Toaster } from "react-hot-toast";

import ToastCard from "components/ToastCard";
import type { NotificationSeverity } from "utils/toastNotification";

type Props = {
  toastOptions?: Partial<DefaultToastOptions>;
};

const ToastNotification: FC<Props> = ({ toastOptions }: Props) => {
  return (
    <Toaster
      position="bottom-right"
      containerClassName="toast-container"
      toastOptions={{
        duration: 5000,
        ...toastOptions,
      }}
      reverseOrder={true}
    >
      {(toastInstance) => (
        <ToastCard
          toastInstance={toastInstance}
          type={toastInstance.type as NotificationSeverity}
        >
          <>{toastInstance.message}</>
        </ToastCard>
      )}
    </Toaster>
  );
};

export default ToastNotification;
