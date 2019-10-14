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
      <Link to="/">
        <img
          className="p-primary-nav__logo"
          src="https://assets.ubuntu.com/v1/a559e2c5-jaas-black-orange-hz-hex.svg"
          alt="JAAS logo"
        />
      </Link>
      <ul className="p-list">
        <li className="p-list__item">
          <a href="https://jaas.ai/store">Store</a>
        </li>
        <li className="p-list__item">
          <a href="https://jaas.ai/about">About</a>
        </li>
        <li className="p-list__item">
          <a href="https://jaas.ai/how-it-works">How it works</a>
        </li>
        <li className="p-list__item">
          <a
            className="p-link--external"
            href="https://discourse.jujucharms.com/"
          >
            Discourse
          </a>
        </li>
        <li className="p-list__item">
          <a className="p-link--external" href="https://jaas.ai/docs/">
            Docs
          </a>
        </li>
      </ul>
      <ul className="p-list internal">
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
