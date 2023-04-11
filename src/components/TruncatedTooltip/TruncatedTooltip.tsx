import { Tooltip, TooltipProps } from "@canonical/react-components";
import classNames from "classnames";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  PropsWithChildren,
} from "react";

import "./_truncated-tooltip.scss";

type Props = {
  tooltipClassName?: TooltipProps["tooltipClassName"];
  positionElementClassName?: TooltipProps["positionElementClassName"];
  wrapperClassName?: string;
} & TooltipProps &
  PropsWithChildren;

/**
   This tooltip has a special power, it only appears if the content is truncated.
*/
const TruncatedTooltip = ({
  children,
  positionElementClassName,
  tooltipClassName,
  wrapperClassName,
  ...tooltipProps
}: Props) => {
  const truncatedNode = useRef<HTMLDivElement>(null);
  const [truncated, setTruncated] = useState(false);

  const checkTruncated = useCallback(() => {
    // Check to see if the content is larger than the frame, in which case the
    // CSS will be truncating the element.
    setTruncated(
      (truncatedNode.current &&
        truncatedNode.current.offsetWidth <
          truncatedNode.current.scrollWidth) ||
        false
    );
  }, [truncatedNode]);

  const resizeObserver = useMemo(
    () => new ResizeObserver(checkTruncated),
    [checkTruncated]
  );

  useEffect(() => {
    const element = truncatedNode.current;
    if (!element) {
      return;
    }
    // Do an initial check for whether the content is truncated.
    checkTruncated();
    // Watch the content for resizes to check if the truncation changes.
    resizeObserver.observe(element);
    return () => {
      if (truncatedNode) {
        resizeObserver.unobserve(element);
      }
    };
  }, [checkTruncated, resizeObserver, truncatedNode]);

  return (
    <div className={classNames("truncated-tooltip", wrapperClassName)}>
      <Tooltip
        {...tooltipProps}
        positionElementClassName={classNames(
          positionElementClassName,
          "truncated-tooltip__position-element"
        )}
        tooltipClassName={classNames(tooltipClassName, {
          "u-hide": !truncated,
        })}
      >
        <div ref={truncatedNode} className="u-truncate">
          {children}
        </div>
      </Tooltip>
    </div>
  );
};

export default TruncatedTooltip;
