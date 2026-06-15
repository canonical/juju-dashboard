import classNames from "classnames";
import type { FC } from "react";
import { useId, useState } from "react";

import useTruncated from "hooks/useTruncated";

type Props = {
  items: string[];
};

/**
   This list has a special power, it only shows the toggle if the collapsed text is truncated.
*/
const TruncatedDetails: FC<Props> = ({ items }: Props) => {
  const content = items.join(", ");
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);
  const { ref: truncatedNode, truncated } = useTruncated(!expanded);

  return (
    <div
      className={classNames("truncated-details", {
        "truncated-details--is-collapsed": !expanded,
        "truncated-details--is-expanded": expanded,
      })}
    >
      <span
        id={contentId}
        ref={truncatedNode}
        className={classNames("truncated-details__content", {
          "u-truncate": !expanded,
          "u-sh1--right": expanded,
        })}
      >
        <b>Disables commands:</b> {content}
      </span>
      {truncated ? (
        <button
          type="button"
          className="truncated-details__toggle p-button--link u-no-margin p-text--small u-no-padding"
          aria-controls={contentId}
          aria-expanded={expanded}
          onClick={() => {
            setExpanded((previous) => !previous);
          }}
        >
          Show {expanded ? "less" : "more"}
        </button>
      ) : null}
    </div>
  );
};

export default TruncatedDetails;
