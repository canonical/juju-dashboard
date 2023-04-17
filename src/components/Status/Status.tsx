import { Spinner } from "@canonical/react-components";
import classNames from "classnames";

type Props = {
  status?: string;
  count?: number | null;
  useIcon?: boolean;
  actionsLogs?: boolean;
  className?: string | null;
};

const Status = ({
  status = "unknown",
  count,
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
        [`is-${status.toLowerCase()}`]: useIcon && status,
      })}
    >
      {status}
      {count || count === 0 ? ` (${count})` : null}
    </span>
  );
};

export default Status;
