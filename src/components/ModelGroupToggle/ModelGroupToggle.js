import React from "react";

import "./_model-group-toggle.scss";

const ButtonToggle = ({ setGroupedBy }) => {
  return (
    <div className="p-model-group-toggle">
      <div className="p-model-group-toggle__inner">
        <span className="p-model-group-toggle__label">Group by:</span>
        <div className="p-model-group-toggle__buttons">
          <button
            className="p-model-group-toggle__button is-selected"
            value="status"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Status
          </button>
          <button
            className="p-model-group-toggle__button"
            value="cloud"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Cloud
          </button>
          <button
            className="p-model-group-toggle__button"
            value="owner"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Owner
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButtonToggle;
