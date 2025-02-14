import type { PropsWithSpread } from "@canonical/react-components";
import classNames from "classnames";
import type { ComponentType, ElementType } from "react";

import logoMark from "static/images/logo/logo-mark.svg";

import "./_logo.scss";
import { TEXT } from "./text";

type Props<C> = PropsWithSpread<
  {
    className?: string;
    dark?: boolean;
    isJuju?: boolean;
    component?: ElementType | ComponentType<C>;
  },
  C
>;

const Logo = <C,>({
  className,
  component: Component = "div",
  dark,
  isJuju,
  ...props
}: Props<C>) => {
  return (
    <Component
      className={classNames("p-panel__logo tag-logo", className)}
      {...props}
    >
      <img
        src={logoMark}
        alt={isJuju ? "Juju" : "JAAS"}
        className="p-panel__logo-image"
      />
      <div className="logo-text">
        <img
          src={TEXT[dark ? "dark" : "light"][isJuju ? "juju" : "jaas"]}
          alt={isJuju ? "Juju" : "JAAS"}
        />
      </div>
    </Component>
  );
};

export default Logo;
