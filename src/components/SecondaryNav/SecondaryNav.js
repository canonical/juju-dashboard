import React from "react";
import { Link } from "react-router-dom";

const SecondaryNav = () => {
  return (
    <ul className="p-list">
      <li className="p-list__item">
        <Link to="/">Models</Link>
      </li>
      <li className="p-list__item">
        <Link to="/clouds">Clouds</Link>
      </li>
      <li className="p-list__item">
        <Link to="/kubernetes">Kubernetes</Link>
      </li>
      <li className="p-list__item">
        <Link to="/controllers">Controllers</Link>
      </li>
      <li className="p-list__item">
        <Link to="/usage">Usage</Link>
      </li>
      <li className="p-list__item">
        <Link to="/logs">Logs</Link>
      </li>
    </ul>
  );
};

export default SecondaryNav;
