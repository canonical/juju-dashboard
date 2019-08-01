import React from 'react';
import { BrowserRouter as Router, Route} from 'react-router-dom';

import Nav from './Nav';

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
      <div>
        <Nav/>
      </div>
      <Route path="/" exact component={Models} />
      <Route path="/clouds" exact component={Clouds} />
      <Route path="/kubernetes" exact component={Kubernetes} />
      <Route path="/controllers" exact component={Controllers} />
      <Route path="/usage" exact component={Usage} />
      <Route path="/logs" exact component={Logs} />
    </Router>
  )
}

export default App;
