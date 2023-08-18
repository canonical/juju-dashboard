import { Icon } from "@canonical/react-components";
import classNames from "classnames";
import { NavLink } from "react-router-dom";

export enum TestId {
  PRIMARY_NAV_LINK = "primary-nav-link",
}

type PrimaryNavLinkProps = {
  children?: React.ReactNode;
  to: string;
  iconName: string;
  title: string;
};

const PrimaryNavLink = ({
  children,
  to,
  iconName,
  title,
}: PrimaryNavLinkProps) => (
  <NavLink
    className={({ isActive }) =>
      classNames("p-list__link", {
        "is-selected": isActive,
      })
    }
    to={to}
    data-testid={TestId.PRIMARY_NAV_LINK}
  >
    <Icon name={iconName} light />
    <span className="hide-collapsed">{title}</span>
    {children}
  </NavLink>
);

export default PrimaryNavLink;
