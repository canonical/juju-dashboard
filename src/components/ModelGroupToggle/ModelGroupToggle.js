import React from "react";
import classNames from "classnames";

import "./_model-group-toggle.scss";

const ModelGroupToggle = ({ groupedBy, setGroupedBy }) => {
  return (
    <div className="p-model-group-toggle">
      <div className="p-model-group-toggle__inner">
        <span className="p-model-group-toggle__label">Group by:</span>
        <div className="p-model-group-toggle__buttons">
          <button
            className={classNames("p-model-group-toggle__button", {
              "is-selected": groupedBy === "status"
            })}
            value="status"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Status
          </button>
          <button
            className={classNames("p-model-group-toggle__button", {
              "is-selected": groupedBy === "cloud"
            })}
            value="cloud"
            onClick={e => setGroupedBy(e.target.value)}
          >
            Cloud
          </button>
          <button
            className={classNames("p-model-group-toggle__button", {
              "is-selected": groupedBy === "owner"
            })}
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

export default ModelGroupToggle;
