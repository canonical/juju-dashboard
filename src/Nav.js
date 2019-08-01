import React from 'react';
import {Link} from 'react-router-dom'

function Nav() {
  return (
    <div>
      <ul>
        <li><Link to="/">Models</Link></li>
        <li><Link to="/clouds">Clouds</Link></li>
        <li><Link to="/kubernetes">Kubernetes</Link></li>
        <li><Link to="/controllers">Controllers</Link></li>
        <li><Link to="/usage">Usage</Link></li>
        <li><Link to="/logs">Logs</Link></li>
      </ul>
    </div>
  );
}

export default Nav;
