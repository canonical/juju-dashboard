import { Button, Notification, Strip } from "@canonical/react-components";
import type { PropsWithChildren } from "react";
import reactHotToast from "react-hot-toast";

import ToastCard from "components/ToastCard/ToastCard";
import { getConnectionError } from "store/general/selectors";
import { getAuditEventsErrors } from "store/juju/selectors";
import { useAppSelector } from "store/store";

const ConnectionError = ({ children }: PropsWithChildren) => {
  const error = useAppSelector(getConnectionError);
  const auditLogsErrors = useAppSelector(getAuditEventsErrors);

  if (auditLogsErrors) {
    reactHotToast.custom((t) => (
      <ToastCard type="negative" toastInstance={t}>
        {auditLogsErrors} Try{" "}
        <Button appearance="link" onClick={() => window.location.reload()}>
          refreshing
        </Button>{" "}
        the page.
      </ToastCard>
    ));
  }

  if (error) {
    return (
      <Strip>
        <Notification severity="negative" title="Error">
          {error} Try{" "}
          <Button appearance="link" onClick={() => window.location.reload()}>
            refreshing
          </Button>{" "}
          the page.
        </Notification>
      </Strip>
    );
  }

  return <>{children}</>;
};

export default ConnectionError;
