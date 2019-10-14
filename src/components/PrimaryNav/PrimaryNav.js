import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "./_primary-nav.scss";

const pages = [
  { label: "Models", path: "/" },
  { label: "Controllers", path: "/controllers" },
  { label: "Usage", path: "/usage" },
  { label: "Logs", path: "/logs" }
];

const PrimaryNav = () => {
  const currentLocation = window.location.pathname;
  return (
    <nav className="p-primary-nav">
      <ul className="p-list">
        {Object.values(pages).map(navItem => (
          <li
            key={navItem.path}
            className={classNames("p-list__item", {
              "is-selected": currentLocation === navItem.path
            })}
          >
            <Link className="p-list__link" to={navItem.path}>
              {navItem.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PrimaryNav;
