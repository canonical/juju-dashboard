import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, Link } from "react-router-dom";
import classNames from "classnames";

import { getGroupedModelStatusCounts } from "app/selectors";

// Image imports
import logoMark from "static/images/logo/logo-mark.svg";
import logoText from "static/images/logo/logo-mark.svg";

// Style imports
import "./_primary-nav.scss";

const pages = [
  { label: "Models", path: "/models", icon: "51642f58-models.svg" },
  {
    label: "Controllers",
    path: "/controllers",
    icon: "8414b187-controllers.svg"
  },
  { label: "Usage", path: "/usage", icon: "1b1d07ae-usage.svg" },
  { label: "Logs", path: "/logs", icon: "741097ff-logs.svg" }
];

const PrimaryNav = () => {
  const [extNavOpen, setExtNavOpen] = useState(false);
  const { blocked } = useSelector(getGroupedModelStatusCounts);
  return (
    <nav
      className={classNames("p-primary-nav", { "ext-nav-open": extNavOpen })}
    >
      <div className="p-primary-nav__header">
        <Link to="/" className="p-primary-nav__logo">
          <img
            className="p-primary-nav__logo-icon"
            src={logoMark}
            alt="JAAS logo"
            height="30"
            width="30"
          />
          <img
            className="p-primary-nav__logo-text"
            src="https://assets.ubuntu.com/v1/2e04d794-logo-jaas.svg"
            height="30"
            alt=""
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
          <li key={navItem.path} className="p-list__item">
            <NavLink
              className="p-list__link"
              isActive={match => {
                if (match && match.url.includes(navItem.path)) {
                  return true;
                }
              }}
              to={navItem.path}
              activeClassName="is-selected"
            >
              <img
                className="p-list__icon"
                src={`https://assets.ubuntu.com/v1/${navItem.icon}`}
                alt={`${navItem.label} icon`}
              />
              {navItem.label}
              {navItem.label === "Models" && blocked > 0 ? (
                <span className="entity-count">{blocked}</span>
              ) : (
                ""
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PrimaryNav;
