import React from "react";
import classNames from "classnames";

import "./_model-group-toggle.scss";

const buttons = ["status", "cloud", "owner"];

const ModelGroupToggle = ({ groupedBy, setGroupedBy }) => {
  return (
    <div className="p-model-group-toggle">
      <div className="p-model-group-toggle__inner">
        <span className="p-model-group-toggle__label">Group by:</span>
        <div className="p-model-group-toggle__buttons">
          {buttons.map((label) => (
            <button
              aria-label={`group by ${label}`}
              key={label}
              className={classNames("p-model-group-toggle__button", {
                "is-selected": groupedBy === label,
              })}
              value={label}
              onClick={(e) => setGroupedBy(e.currentTarget.value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModelGroupToggle;
