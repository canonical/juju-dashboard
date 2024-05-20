import type { PropsWithSpread } from "@canonical/react-components";
import classNames from "classnames";
import type { ComponentType, ElementType } from "react";

import jaasDarkText from "static/images/logo/jaas-text-dark.svg";
import jaasLightText from "static/images/logo/jaas-text.svg";
import jujuDarkText from "static/images/logo/juju-text-dark.svg";
import jujuLightText from "static/images/logo/juju-text.svg";
import logoMark from "static/images/logo/logo-mark.svg";

import "./_logo.scss";

type Props<C> = PropsWithSpread<
  {
    className?: string;
    dark?: boolean;
    isJuju?: boolean;
    component?: ElementType | ComponentType<C>;
  },
  C
>;

const TEXT = {
  dark: {
    juju: jujuDarkText,
    jaas: jaasDarkText,
  },
  light: {
    juju: jujuLightText,
    jaas: jaasLightText,
  },
};

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
