import type { PropsWithSpread } from "@canonical/react-components";
import { Spinner } from "@canonical/react-components";
import classnames from "classnames";
import type { PropsWithChildren } from "react";

import SlideInOut from "animations/SlideInOut";
import type { Props as SlideInOutProps } from "animations/SlideInOut";

import "./_aside.scss";

export type Props = PropsWithSpread<
  {
    className?: string;
    width?: "wide" | "narrow";
    pinned?: boolean;
    loading?: boolean;
    isSplit?: boolean;
  },
  Partial<SlideInOutProps> & PropsWithChildren
>;

export default function Aside({
  children,
  className,
  width,
  pinned = false,
  loading = false,
  isSplit = false,
  ...props
}: Props): JSX.Element {
  return (
    <SlideInOut
      isActive={true}
      className={classnames("l-aside", className, {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned === true,
        "is-split": isSplit === true,
      })}
      {...props}
    >
      {!loading ? (
        <>{children}</>
      ) : (
        <div className="loading">
          <Spinner />
        </div>
      )}
    </SlideInOut>
  );
}
