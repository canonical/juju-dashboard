import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import "./_primary-nav.scss";

const pages = [
  { label: "Models", path: "/", icon: "51642f58-models.svg" },
  {
    label: "Controllers",
    path: "/controllers",
    icon: "8414b187-controllers.svg"
  },
  { label: "Usage", path: "/usage", icon: "1b1d07ae-usage.svg" },
  { label: "Logs", path: "/logs", icon: "741097ff-logs.svg" }
];

const PrimaryNav = () => {
  const currentLocation = window.location.pathname;
  const [extNavOpen, setExtNavOpen] = useState(false);
  return (
    <nav
      className={classNames("p-primary-nav", { "ext-nav-open": extNavOpen })}
    >
      <div className="p-primary-nav__header">
        <Link to="/">
          <img
            className="p-primary-nav__logo"
            src="https://assets.ubuntu.com/v1/a9e0ed4a-jaas-logo1.svg"
            alt="JAAS logo"
          />
        </Link>
        <button
          className="p-primary-nav__toggle"
          onClick={() => setExtNavOpen(!extNavOpen)}
        >
          <i className="p-icon--contextual-menu">Toggle external navigation</i>
        </button>
      </div>
      <ul className="p-list is-external">
        <li className="p-list__item">
          <a
            className="p-list__link"
            href="https://jaas.ai/store"
            target="_blank"
            rel="noopener noreferrer"
          >
            Store
          </a>
        </li>
        <li className="p-list__item">
          <a
            className="p-list__link"
            href="https://jaas.ai/about"
            target="_blank"
            rel="noopener noreferrer"
          >
            About
          </a>
        </li>
        <li className="p-list__item">
          <a
            className="p-list__link"
            href="https://jaas.ai/how-it-works"
            target="_blank"
            rel="noopener noreferrer"
          >
            How it works
          </a>
        </li>
        <li className="p-list__item">
          <a
            className="p-link--external p-list__link"
            href="https://discourse.jujucharms.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discourse
          </a>
        </li>
        <li className="p-list__item">
          <a
            className="p-link--external p-list__link"
            href="https://jaas.ai/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </a>
        </li>
      </ul>
      <ul className="p-list is-internal">
        {pages.map(navItem => (
          <li
            key={navItem.path}
            className={classNames("p-list__item", {
              "is-selected": currentLocation === navItem.path
            })}
          >
            <Link className="p-list__link" to={navItem.path}>
              <img
                className="p-list__icon"
                src={`https://assets.ubuntu.com/v1/${navItem.icon}`}
                alt={`${navItem.label} icon`}
              />
              {navItem.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PrimaryNav;
