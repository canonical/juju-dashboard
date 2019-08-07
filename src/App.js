import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Nav from "./components/Nav/Nav";

// All following components are placeholders and will be replaced with imports.
function Models() {
  return <h2>Models</h2>;
}

function Clouds() {
  return <h2>Clouds</h2>;
}

function Kubernetes() {
  return <h2>Kubernetes</h2>;
}

function Controllers() {
  return <h2>Controllers</h2>;
}

function Usage() {
  return <h2>Usage</h2>;
}

function Logs() {
  return <h2>Logs</h2>;
}

function App() {
  return (
    <Router>
      <Nav />

        <div className="l-container">
          <div className="l-side">
            <div className="p-card">
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
            </div>
          </div>
        <div className="l-main">
            <main id="main-content">
              <Route path="/" exact component={Models} />
              <Route path="/clouds" exact component={Clouds} />
              <Route path="/kubernetes" exact component={Kubernetes} />
              <Route path="/controllers" exact component={Controllers} />
              <Route path="/usage" exact component={Usage} />
              <Route path="/logs" exact component={Logs} />
            </main>
          </div>
        </div>

    </Router>
  );
}

export default App;
