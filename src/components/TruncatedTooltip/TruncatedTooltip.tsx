import type { TooltipProps } from "@canonical/react-components";
import { Tooltip } from "@canonical/react-components";
import classNames from "classnames";
import type {
  ComponentType,
  ElementType,
  HTMLProps,
  PropsWithChildren,
} from "react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";

type Props = {
  tooltipClassName?: TooltipProps["tooltipClassName"];
  positionElementClassName?: TooltipProps["positionElementClassName"];
  wrapperClassName?: string;
  element?: ComponentType | ElementType;
  elementProps?: HTMLProps<HTMLElement>;
} & PropsWithChildren &
  TooltipProps;

/**
   This tooltip has a special power, it only appears if the content is truncated.
*/
const TruncatedTooltip = ({
  children,
  positionElementClassName,
  tooltipClassName,
  wrapperClassName,
  element: Component = "div",
  elementProps,
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
        false,
    );
  }, [truncatedNode]);

  const resizeObserver = useMemo(
    () => new ResizeObserver(checkTruncated),
    [checkTruncated],
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
      if (truncatedNode !== null) {
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
          "truncated-tooltip__position-element",
        )}
        tooltipClassName={classNames(tooltipClassName, {
          "u-hide": !truncated,
        })}
      >
        <Component ref={truncatedNode} className="u-truncate" {...elementProps}>
          {children}
        </Component>
      </Tooltip>
    </div>
  );
};

export default TruncatedTooltip;
