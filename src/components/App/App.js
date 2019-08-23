import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";
import MainTable from "../MainTable/MainTable";

import "../../scss/_layout.scss";

const MainTableHeaders = [
  { content: null },
  { content: "Foundation Cloud" },
  { content: "Foundation Cloud Plus" }
];

const MainTableRows = [
  {
    columns: [
      {
        content: "Expert delivery of an Ubuntu OpenStack cloud",
        role: "rowheader"
      },
      { content: "Reference architecture" },
      { content: "Custom architecture" }
    ]
  },
  {
    columns: [
      { content: "Workshop and training", role: "rowheader" },
      { content: "2-days" },
      { content: "4-days" }
    ]
  },
  {
    columns: [
      { content: "One-time price", role: "rowheader" },
      { content: "$75,000" },
      { content: "$150,000" }
    ]
  }
];

// All following components are placeholders and will be replaced with imports.
function Models() {
  return (
    <>
      <h2>Models</h2>
      <MainTable headers={MainTableHeaders} rows={MainTableRows} />
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
