import React from "react";

import "./_button-toggle.scss";

const ButtonToggle = ({ setGroupedBy }) => {
  return (
    <div className="p-button-toggle">
      <div className="p-button-toggle__inner">
        <span className="p-button-toggle__label">Group by:</span>
        <div className="p-button-toggle__buttons">
          <button
            className="p-button-toggle__button is-selected"
            value="status"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Status
          </button>
          <button
            className="p-button-toggle__button"
            value="cloud"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Cloud
          </button>
          <button
            className="p-button-toggle__button"
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
