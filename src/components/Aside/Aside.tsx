import SlideInOut from "animations/SlideInOut";
import classnames from "classnames";

import { Spinner } from "@canonical/react-components";

import "./_aside.scss";

type Props = {
  children: JSX.Element;
  width?: "wide" | "narrow";
  pinned?: boolean;
  loading?: boolean;
  isSplit?: boolean;
};

export default function Aside({
  children,
  width,
  pinned = false,
  loading = false,
  isSplit = false,
}: Props): JSX.Element {
  return (
    <SlideInOut
      isActive={true}
      className={classnames("l-aside", {
        "is-narrow": width === "narrow",
        "is-wide": width === "wide",
        "is-pinned": pinned === true,
        "is-split": isSplit === true,
      })}
    >
      {!loading ? (
        children
      ) : (
        <div className="loading">
          <Spinner />
        </div>
      )}
    </SlideInOut>
  );
}
