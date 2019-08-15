import React from "react";
import { Link } from "react-router-dom";

import "./_secondary-nav.scss";

const SecondaryNav = () => {
  return (
    <nav className="p-secondary-nav">
      <ul className="p-list">
        <li className="p-list__item is-selected">
          <Link className="p-list__link" to="/">
            Models
          </Link>
        </li>
        <li className="p-list__item">
          <Link className="p-list__link" to="/clouds">
            Clouds
          </Link>
        </li>
        <li className="p-list__item">
          <Link className="p-list__link" to="/kubernetes">
            Kubernetes
          </Link>
        </li>
        <li className="p-list__item">
          <Link className="p-list__link" to="/controllers">
            Controllers
          </Link>
        </li>
        <li className="p-list__item">
          <Link className="p-list__link" to="/usage">
            Usage
          </Link>
        </li>
        <li className="p-list__item">
          <Link className="p-list__link" to="/logs">
            Logs
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SecondaryNav;
