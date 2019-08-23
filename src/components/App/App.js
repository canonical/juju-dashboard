import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";
import MainTable from "../MainTable/MainTable";

import "../../scss/_layout.scss";

const MainTableHeaders = [
  { content: "Status", sortKey: "status" },
  { content: "Cores", sortKey: "cores", className: "u-align--right" },
  { content: "RAM", sortKey: "ram", className: "u-align--right" },
  { content: "Disks", sortKey: "disks", className: "u-align--right" }
];

const MainTableRows = [
  {
    columns: [
      { content: "Ready", role: "rowheader" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB", className: "u-align--right" },
      { content: 2, className: "u-align--right" }
    ],
    sortData: {
      status: "ready",
      cores: 2,
      ram: 1,
      disks: 2
    }
  },
  {
    columns: [
      { content: "Idle", role: "rowheader" },
      { content: 1, className: "u-align--right" },
      { content: "1 GiB", className: "u-align--right" },
      { content: 2, className: "u-align--right" }
    ],
    sortData: {
      status: "idle",
      cores: 1,
      ram: 1,
      disks: 2
    }
  },
  {
    columns: [
      { content: "Waiting", role: "rowheader" },
      { content: 8, className: "u-align--right" },
      { content: "3.9 GiB", className: "u-align--right" },
      { content: 3, className: "u-align--right" }
    ],
    sortData: {
      status: "waiting",
      cores: 8,
      ram: 3.9,
      disks: 3
    }
  }
];

// All following components are placeholders and will be replaced with imports.
function Models() {
  return (
    <>
      <h2>Models</h2>
      <MainTable headers={MainTableHeaders} rows={MainTableRows} sortable />
    </>
  );
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
