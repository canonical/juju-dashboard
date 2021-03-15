import classnames from "classnames";
import SlideInOut from "animations/SlideInOut";

import "./_aside.scss";

type Props = {
  children: JSX.Element;
  width?: "wide" | "narrow";
  pinned?: boolean;
};

export default function Aside({
  children,
  width,
  pinned = false,
}: Props): JSX.Element {
  return (
    <SlideInOut
      isActive={true}
      className={classnames("l-aside", {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned === true,
      })}
    >
      {children}
    </SlideInOut>
  );
}
