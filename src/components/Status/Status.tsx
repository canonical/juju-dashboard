import { Spinner } from "@canonical/react-components";
import classNames from "classnames";
import type { PropsWithChildren } from "react";

type Props = {
  status?: string;
  count?: number | null;
  inline?: boolean;
  useIcon?: boolean;
  actionsLogs?: boolean;
  className?: string | null;
} & PropsWithChildren;

const Status = ({
  status = "unknown",
  children,
  count = null,
  inline,
  useIcon = true,
  actionsLogs = false,
  className = null,
}: Props) => {
  // ActionLogs uses a spinner icon if 'running'
  if (actionsLogs && status.toLowerCase() === "running") {
    return <Spinner className="status-icon is-spinner" text={status} />;
  }

  return (
    <span
      className={classNames(className, {
        "status-icon": useIcon,
        "status-icon--inline": inline,
        [`is-${status.toLowerCase()}`]: useIcon && status,
      })}
    >
      {children ?? status}
      {count !== null ? ` (${count})` : null}
    </span>
  );
};

export default Status;
