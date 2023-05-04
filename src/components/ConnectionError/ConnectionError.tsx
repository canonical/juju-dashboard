import { Button, Notification, Strip } from "@canonical/react-components";
import type { PropsWithChildren } from "react";

import { getConnectionError } from "store/general/selectors";
import { useAppSelector } from "store/store";

const ConnectionError = ({ children }: PropsWithChildren) => {
  const error = useAppSelector(getConnectionError);
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
