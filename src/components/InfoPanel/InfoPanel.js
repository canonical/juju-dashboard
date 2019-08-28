import React, { Component } from "react";

import "./_info-panel.scss";

export default class InfoPanel extends Component {
  render() {
    return (
      <div className="info-panel">
        <div className="info-panel__grid">
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">Model</h4>
            <p>cdk-default</p>
          </div>
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">Region</h4>
            <p>us-east-1</p>
          </div>
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">Controller</h4>
            <p>aws-controller</p>
          </div>
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">Version</h4>
            <p>2.3.7</p>
          </div>
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">Cloud</h4>
            <p>aws</p>
          </div>
          <div className="info-panel__grid-item">
            <h4 className="p-muted-heading">SLA</h4>
            <p>Unsupported</p>
          </div>
        </div>
      </div>
    );
  }
}
