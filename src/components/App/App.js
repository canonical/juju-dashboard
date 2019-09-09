import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import Layout from "components/Layout/Layout";
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary";
import TableList from "components/TableList/TableList";

import ModelDetails from "containers/ModelDetails/ModelDetails";

// All following components are placeholders and will be replaced with imports.
function Models() {
  return (
    <Layout sidebar>
      {/* Inline styles is a temporary fix until this view gets it's own styling container. */}
      <div className="row" style={{ paddingTop: "1rem" }}>
        <h2>Models</h2>
        <TableList />
      </div>
    </Layout>
  );
}

function ModelsDetailsView() {
  return (
    <Layout>
      <ModelDetails />
    </Layout>
  );
}

function Clouds() {
  return (
    <Layout>
      <h2>Clouds</h2>
    </Layout>
  );
}

function Kubernetes() {
  return (
    <Layout>
      <h2>Kubernetes</h2>
    </Layout>
  );
}

function Controllers() {
  return (
    <Layout>
      <h2>Controllers</h2>
    </Layout>
  );
}

function Usage() {
  return (
    <Layout>
      <h2>Usage</h2>
    </Layout>
  );
}

function Logs() {
  return (
    <Layout>
      <h2>Logs</h2>
    </Layout>
  );
}

function Notfound() {
  return (
    <Layout>
      <h2>Not found ¯\_(ツ)_/¯</h2>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Switch>
          <Route path="/" exact component={Models} />
          <Route path="/models/:id" exact component={ModelsDetailsView} />
          <Route path="/clouds" exact component={Clouds} />
          <Route path="/kubernetes" exact component={Kubernetes} />
          <Route path="/controllers" exact component={Controllers} />
          <Route path="/usage" exact component={Usage} />
          <Route path="/logs" exact component={Logs} />
          <Route component={Notfound} />
        </Switch>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
