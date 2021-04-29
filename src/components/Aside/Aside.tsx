import classnames from "classnames";
import SlideInOut from "animations/SlideInOut";

import Spinner from "@canonical/react-components/dist/components/Spinner/Spinner";

import "./_aside.scss";

type Props = {
  children: JSX.Element;
  width?: "wide" | "narrow";
  pinned?: boolean;
  loading?: boolean;
};

export default function Aside({
  children,
  width,
  pinned = false,
  loading = false,
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
