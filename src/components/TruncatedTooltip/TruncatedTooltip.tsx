import type { TooltipProps } from "@canonical/react-components";
import { Tooltip } from "@canonical/react-components";
import classNames from "classnames";
import type {
  ComponentType,
  ElementType,
  FC,
  HTMLProps,
  PropsWithChildren,
} from "react";

import useTruncated from "hooks/useTruncated";

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
const TruncatedTooltip: FC<Props> = ({
  children,
  positionElementClassName,
  tooltipClassName,
  wrapperClassName,
  element: Component = "div",
  elementProps,
  ...tooltipProps
}: Props) => {
  const { ref: truncatedNode, truncated } = useTruncated();

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
