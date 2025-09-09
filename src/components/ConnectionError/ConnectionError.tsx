import { Button, Notification, Strip } from "@canonical/react-components";
import { useEffect, type PropsWithChildren } from "react";
import reactHotToast from "react-hot-toast";

import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import { getConnectionError } from "store/general/selectors";
import { getAuditEventsErrors } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const ConnectionError = ({ children }: PropsWithChildren) => {
  const error = useAppSelector(getConnectionError);
  const auditLogsErrors = useAppSelector(getAuditEventsErrors);

  const generateErrorContent = (errorMessage: string) => (
    <>
      {errorMessage} Try{" "}
      <Button appearance="link" onClick={() => window.location.reload()}>
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
        <Notification severity="negative" title="Error">
          {generateErrorContent(error)}
        </Notification>
      </Strip>
    );
  }

  return <>{children}</>;
};

export default ConnectionError;
