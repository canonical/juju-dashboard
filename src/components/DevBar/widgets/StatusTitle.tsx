import classNames from "classnames";
import type { JSX } from "react";

export function StatusTitle({
  title,
  status,
  label,
}: {
  title: string;
  status?: boolean;
  label: string;
}): JSX.Element {
  return (
    <>
      {title}
      <span
        className={classNames("dev-bar__user-status", "u-text--muted", {
          "show-status": status !== undefined,
          positive: status,
        })}
      >
        {label}
      </span>
    </>
  );
}
