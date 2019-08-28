import React, { Component } from "react";

import "./_info-panel.scss";

export default class InfoPanel extends Component {
  render() {
    const gridData = [
      {
        label: "Model",
        value: "cdk-default"
      },
      {
        label: "Region",
        value: "us-east-1"
      },
      {
        label: "Controller",
        value: "aws-controller"
      },
      {
        label: "Cloud",
        value: "aws"
      },
      {
        label: "SLA",
        value: "Unsupported"
      }
    ];
    const gridItems = gridData.map(item => (
      <div key={item.label} className="info-panel__grid-item">
        <h4 className="p-muted-heading">{item.label}</h4>
        <p>{item.value}</p>
      </div>
    ));
    return (
      <div className="info-panel">
        <div className="info-panel__grid">{gridItems}</div>
      </div>
    );
  }
}
