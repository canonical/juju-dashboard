import classNames from "classnames";
import type { FC } from "react";
import { useId, useState } from "react";

import useTruncated from "hooks/useTruncated";

type Props = {
  items: string[];
};

/**
   This list of commands has a special power, it only shows the toggle if the collapsed text is truncated.
*/
const TruncatedCommands: FC<Props> = ({ items }: Props) => {
  const content = items.join(", ");
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);
  const { ref: truncatedNode, truncated } = useTruncated(!expanded);

  return (
    <div
      className={classNames("truncated-commands", {
        "truncated-commands--is-collapsed": !expanded,
        "truncated-commands--is-expanded": expanded,
      })}
    >
      <span
        id={contentId}
        ref={truncatedNode}
        className={classNames("truncated-commands__content", {
          "u-truncate": !expanded,
          "u-sh1--right": expanded,
        })}
      >
        <b>Disables commands:</b> {content}
      </span>
      {truncated ? (
        <button
          type="button"
          className="truncated-commands__toggle p-button--link u-no-margin p-text--small u-no-padding"
          data-testid="truncated-commands-toggle"
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

export default TruncatedCommands;
