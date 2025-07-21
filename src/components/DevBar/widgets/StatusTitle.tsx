import classNames from "classnames";

export function StatusTitle({
  title,
  status,
  label,
}: {
  title: string;
  status?: boolean;
  label: string;
}) {
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
