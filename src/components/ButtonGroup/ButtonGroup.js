import React from "react";
import classNames from "classnames";

import "./_button-group.scss";

const ButtonGroup = ({ buttons, groupedBy, setGroupedBy }) => {
  return (
    <div className="p-button-group">
      <div className="p-button-group__inner">
        <span className="p-button-group__label">Group by:</span>
        <div className="p-button-group__buttons">
          {buttons.map((label) => (
            <button
              aria-label={`group by ${label}`}
              key={label}
              className={classNames("p-button-group__button", {
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

export default ButtonGroup;
