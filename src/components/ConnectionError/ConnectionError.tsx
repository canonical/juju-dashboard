import {
  Button,
  Notification as ReactNotification,
  Strip,
} from "@canonical/react-components";
import type { FC, ReactNode } from "react";
import { useEffect, type PropsWithChildren } from "react";
import reactHotToast from "react-hot-toast";

import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import { getConnectionError } from "store/general/selectors";
import { getAuditEventsErrors } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const ConnectionError: FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const error = useAppSelector(getConnectionError);
  const auditLogsErrors = useAppSelector(getAuditEventsErrors);

  const generateErrorContent = (errorMessage: string): ReactNode => (
    <>
      {errorMessage} Try{" "}
      <Button
        appearance="link"
        onClick={() => {
          window.location.reload();
        }}
      >
        refreshing
      </Button>{" "}
      the page.
    </>
  );

  useEffect(() => {
    if (auditLogsErrors) {
      reactHotToast.custom((toast: ToastInstance) => (
        <ToastCard type="negative" toastInstance={toast}>
          {generateErrorContent(auditLogsErrors)}
        </ToastCard>
      ));
    }
  }, [auditLogsErrors]);

  if (error) {
    return (
      <Strip>
        <ReactNotification severity="negative" title="Error">
          {generateErrorContent(error)}
        </ReactNotification>
      </Strip>
    );
  }

  return <>{children}</>;
};

export default ConnectionError;
