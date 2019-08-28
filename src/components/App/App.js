import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Layout from "../Layout/Layout";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import TableList from "../TableList/TableList";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";
import MainTable from "../MainTable/MainTable";
import Shell from "../Shell/Shell";
import Filter from "../Filter/Filter";

import "../../scss/_layout.scss";

const modelTableHeaders = [
  { content: "Name", sortKey: "name" },
  { content: "Owner", sortKey: "owner" },
  { content: "Summary", sortKey: "summary" },
  { content: "Cloud", sortKey: "cloud" },
  { content: "Region", sortKey: "region" },
  { content: "Credential", sortKey: "credential" },
  { content: "Controller", sortKey: "controller" },
  { content: "Last Updated", sortKey: "last-updated" }
];

// All following components are placeholders and will be replaced with imports.
function Models() {
  return (
    <Layout sidebar>
      <h2>Models</h2>
      <MainTable headers={MainTableHeaders} rows={MainTableRows} sortable />
    </Layout>
  );
}

function ModelsExample() {
  const viewFilters = ["all", "apps", "units", "machines", "relations"];
  const statusFilters = ["all", "maintenance", "blocked"];
  return (
    <Layout>
      <div className="row">
        <div className="col-2">
          <div className="row">
            <div className="col-1">
              <h4 className="p-muted-heading">Model</h4>
              <p>cdk-default</p>
            </div>
            <div className="col-1">
              <h4 className="p-muted-heading">Region</h4>
              <p>us-east-1</p>
            </div>
            <div className="col-1">
              <h4 className="p-muted-heading">Controller</h4>
              <p>aws-controller</p>
            </div>
            <div className="col-1">
              <h4 className="p-muted-heading">Version</h4>
              <p>2.3.7</p>
            </div>
            <div className="col-1">
              <h4 className="p-muted-heading">Cloud</h4>
              <p>aws</p>
            </div>
            <div className="col-1">
              <h4 className="p-muted-heading">SLA</h4>
              <p>Unsupported</p>
            </div>
          </div>
        </div>
        <div className="col-10">
          <div className="row">
            <div className="col-5">
              <Filter label="View" filters={viewFilters} />
            </div>
            <div className="col-5">
              <Filter label="Status" filters={statusFilters} />
            </div>
          </div>
          <MainTable headers={MainTableHeaders} rows={MainTableRows} sortable />
        </div>
      </div>
      <Shell />
    </Layout>
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
      <ErrorBoundary>
        <Route path="/" exact component={Models} />
        <Route path="/models/:id" exact component={ModelsExample} />
        <Route path="/clouds" exact component={Clouds} />
        <Route path="/kubernetes" exact component={Kubernetes} />
        <Route path="/controllers" exact component={Controllers} />
        <Route path="/usage" exact component={Usage} />
        <Route path="/logs" exact component={Logs} />
      </ErrorBoundary>
    </Router>
  );
}

export default App;
