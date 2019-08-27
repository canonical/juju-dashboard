import React, { Component } from "react";

import "./_shell.scss";

export default class Shell extends Component {
  render() {
    return (
      <div className="shell">
        <p>Welcome to the Juju shell - see the docs at https://jaas.ai/docs</p>
        <p>shell:-$</p>
      </div>
    );
  }
}
