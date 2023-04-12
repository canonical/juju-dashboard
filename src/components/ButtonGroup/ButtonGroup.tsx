import type { ButtonProps } from "@canonical/react-components";
import { Button } from "@canonical/react-components";
import classNames from "classnames";
import type { ComponentType, ElementType } from "react";

import "./_button-group.scss";

export enum TestId {
  LABEL = "label",
}

type Props<P = ButtonProps> = {
  buttons: ({ key: string } & P)[];
  buttonComponent?: ElementType | ComponentType<P>;
  label?: string;
  noWrap?: boolean;
  activeButton: string;
};

const ButtonGroup = <P,>({
  buttons,
  buttonComponent,
  label,
  noWrap,
  activeButton,
}: Props<P>): JSX.Element => {
  return (
    <div className="p-button-group">
      <div className="p-button-group__inner">
        {label ? (
          <span
            className={classNames("p-button-group__label", {
              "p-button-group__label--fixed": noWrap,
            })}
            data-testid={TestId.LABEL}
          >
            {label}
          </span>
        ) : null}
        <div className="p-button-group__buttons">
          {buttons.map(({ key, ...buttonProps }, i) => (
            <Button
              element={buttonComponent}
              key={key}
              className={classNames("p-button-group__button", {
                "is-selected": activeButton === key,
              })}
              {...buttonProps}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonGroup;
