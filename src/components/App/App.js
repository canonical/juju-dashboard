import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Layout from "../Layout/Layout";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import TableList from "../TableList/TableList";
import PrimaryNav from "../PrimaryNav/PrimaryNav";
import SecondaryNav from "../SecondaryNav/SecondaryNav";
import MainTable from "../MainTable/MainTable";
import Shell from "../Shell/Shell";

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

function ModelsExample(props) {
  return (
    <Layout>
      <h2>{props.match.params.id}</h2>
      <MainTable headers={MainTableHeaders} rows={MainTableRows} sortable />
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
