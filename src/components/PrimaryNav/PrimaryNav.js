import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import classNames from "classnames";

import { getGroupedModelStatusCounts } from "app/selectors";

import User from "components/User/User";

// Image imports
import logoMark from "static/images/logo/logo-mark.svg";
import logoText from "static/images/logo/logo-text.svg";
import bugIcon from "static/images/icons/bug-icon.svg";
import modelsIcon from "static/images/icons/models-icon.svg";
import modelsIconSelected from "static/images/icons/models-icon--selected.svg";
import controllersIcon from "static/images/icons/controllers-icon.svg";
import controllersIconSelected from "static/images/icons/controllers-icon--selected.svg";
// Remove these nav links until these sections are active
// import usageIcon from "static/images/icons/usage-icon.svg";
// import usageIconSelected from "static/images/icons/usage-icon--selected.svg";
// import logsIcon from "static/images/icons/logs-icon.svg";
// import logsIconSelected from "static/images/icons/logs-icon--selected.svg";

// Style imports
import "./_primary-nav.scss";

const pages = [
  {
    label: "Models",
    path: "/models",
    icon: modelsIcon,
    iconSelected: modelsIconSelected
  },
  {
    label: "Controllers",
    path: "/controllers",
    icon: controllersIcon,
    iconSelected: controllersIconSelected
  }
  // Remove these nav links until these sections are active
  // { label: "Usage", path: "/usage", icon: usageIcon, iconSelected: usageIconSelected },
  // { label: "Logs", path: "/logs", icon: logsIcon, iconSelected: logsIconSelected },
];

const PrimaryNav = () => {
  const [extNavOpen, setExtNavOpen] = useState(false);
  const [activeLinkValue, setActiveLinkValue] = useState("");
  const { blocked } = useSelector(getGroupedModelStatusCounts);

  return (
    <nav
      className={classNames("p-primary-nav", { "ext-nav-open": extNavOpen })}
    >
      <div className="p-primary-nav__header">
        <a href="https://jaas.ai" className="p-primary-nav__logo">
          <img
            className="p-primary-nav__logo-icon"
            src={logoMark}
            alt="JAAS logo"
            height="30"
            width="30"
          />
          <img
            className="p-primary-nav__logo-text"
            src={logoText}
            height="30"
            alt=""
          />
        </a>
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
            href="https://jaas.ai/jaas"
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
                  setActiveLinkValue(navItem.path);
                  return true;
                }
              }}
              to={navItem.path}
              activeClassName="is-selected"
            >
              <img
                className="p-list__icon"
                src={
                  activeLinkValue === navItem.path
                    ? navItem.iconSelected
                    : navItem.icon
                }
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
      <div className="p-primary-nav__bottom">
        <ul className="p-list">
          <li className="p-list__item">
            <a
              className="p-list__link"
              href="https://github.com/canonical-web-and-design/jaas-dashboard/issues/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img className="p-list__icon" src={bugIcon} alt={`bug icon`} />
              Report a bug
            </a>
          </li>
          <li className="p-list__item">
            <span className="version">Version 0.0.2</span>
            <span className="p-label--new">Alpha</span>
          </li>
        </ul>
      </div>
      <User />
    </nav>
  );
};

export default PrimaryNav;
