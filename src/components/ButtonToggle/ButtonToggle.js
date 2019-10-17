import React from "react";

import "./_button-toggle.scss";

const ButtonToggle = () => {
  return (
    <div className="p-button-toggle">
      <span className="p-button-toggle__label">Group by:</span>
      <div className="p-button-toggle__buttons">
        <button className="p-button-toggle__button is-selected">Status</button>
        <button className="p-button-toggle__button">Cloud</button>
        <button className="p-button-toggle__button">Owner</button>
      </div>
    </div>
  );
};

export default ButtonToggle;
