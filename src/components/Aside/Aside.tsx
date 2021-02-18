import { ReactNode } from "react";
import classnames from "classnames";

import "./_aside.scss";

type Props = {
  children: ReactNode | ReactNode[];
  width?: "wide" | "narrow";
  pinned?: boolean;
};

export default function Aside({
  children,
  width,
  pinned = false,
}: Props): JSX.Element {
  return (
    <div
      className={classnames("l-aside", {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned === true,
      })}
    >
      {children}
    </div>
  );
}
