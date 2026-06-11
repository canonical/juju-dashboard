import classNames from "classnames";
import type { FC } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type Props = {
  items: string[];
};

/**
   This list has a special power, it only shows the toggle if the collapsed text is truncated.
*/
const TruncatedDetails: FC<Props> = ({ items }: Props) => {
  const content = items.join(", ");
  const contentId = useId();
  const truncatedNode = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  const checkTruncated = useCallback(() => {
    if (expanded) {
      return;
    }
    // Check to see if the content is larger than the frame, in which case the
    // CSS will be truncating the element.
    setTruncated(
      (truncatedNode.current &&
        truncatedNode.current.offsetWidth <
          truncatedNode.current.scrollWidth) ??
        false,
    );
  }, [expanded]);

  const resizeObserver = useMemo(
    () => new ResizeObserver(checkTruncated),
    [checkTruncated],
  );

  useEffect(() => {
    const element = truncatedNode.current;
    if (!element || expanded) {
      return;
    }
    // Do an initial check for whether the content is truncated.
    checkTruncated();
    // Watch the content for resizes to check if the truncation changes.
    resizeObserver.observe(element);
    return (): void => {
      if (truncatedNode) {
        resizeObserver.unobserve(element);
      }
    };
  }, [checkTruncated, expanded, resizeObserver]);

  return (
    <div className="truncated-details">
      <span
        id={contentId}
        ref={truncatedNode}
        className={classNames("truncated-details__content", {
          "truncated-details__is-collapsed": !expanded,
          "truncated-details__is-expanded": expanded,
          "u-truncate": !expanded,
        })}
      >
        <b>Disables commands:</b> {content}
      </span>
      {truncated ? (
        <button
          type="button"
          className="p-button--link u-no-margin--bottom u-sh1 p-text--small u-no-padding"
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
