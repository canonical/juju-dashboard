import type { FC } from "react";
import type { Toast } from "react-hot-toast";

import ToastCard from "components/ToastCard";
import type { NotificationSeverity } from "utils/toastNotification";

type Props = {
  toastInstance: Toast;
};

const ToastNotification: FC<Props> = ({ toastInstance }: Props) => {
  return (
    <ToastCard
      toastInstance={toastInstance}
      type={toastInstance.type as NotificationSeverity}
    >
      <>{toastInstance.message}</>
    </ToastCard>
  );
};

export default ToastNotification;
