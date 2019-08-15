import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import PrimaryNav from "./components/PrimaryNav/PrimaryNav";
import SecondaryNav from "./components/SecondaryNav/SecondaryNav";

import "./scss/_layout.scss";

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
      <PrimaryNav />
      <div className="l-container">
        <div className="l-side">
          <SecondaryNav />
        </div>
        <div className="l-main">
          <main id="main-content">
            <ErrorBoundary>
              <Route path="/" exact component={Models} />
              <Route path="/clouds" exact component={Clouds} />
              <Route path="/kubernetes" exact component={Kubernetes} />
              <Route path="/controllers" exact component={Controllers} />
              <Route path="/usage" exact component={Usage} />
              <Route path="/logs" exact component={Logs} />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
