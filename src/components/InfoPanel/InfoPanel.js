import React from "react";
import PropTypes from "prop-types";

import "./_info-panel.scss";

const InfoPanel = ({ modelStatus }) => {
  return (
    <div className="info-panel">
      <div className="info-panel__grid">
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Model</h4>
          <p data-name="name">{modelStatus.model.name}</p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Region</h4>
          <p data-name="region">{modelStatus.model.region}</p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Controller</h4>
          <p data-name="controller">{modelStatus.model.type}</p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Cloud</h4>
          <p data-name="cloud">{modelStatus.model.cloudTag}</p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">SLA</h4>
          <p data-name="sla">{modelStatus.model.sla}</p>
        </div>
      </div>
      <img
        src="https://assets.ubuntu.com/v1/f3f75945-home-promo-bundle.svg"
        alt=""
      />
    </div>
  );
};

InfoPanel.defaultProps = {
  modelStatus: {
    model: {
      name: "",
      region: "",
      type: "",
      cloudTag: "",
      sla: ""
    }
  }
};

InfoPanel.propTypes = {
  modelStatus: PropTypes.object.isRequired
};

export default InfoPanel;
