import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import queryString from "query-string";

import "./_model-group-toggle.scss";

const buttons = ["status", "cloud", "owner"];

const ModelGroupToggle = ({ groupedBy, setGroupedBy }) => {
  const history = useHistory();
  const queryStrings = queryString.parse(window.location.search);
  queryStrings.groupedby = groupedBy;
  useEffect(() => {
    if (groupedBy === "status") {
      history.push({
        pathname: "/models",
        search: null
      });
    } else {
      history.push({
        pathname: "/models",
        search: queryString.stringify(queryStrings)
      });
    }
    // Including queryStrings to the dependency array will trigger an infinite loop
    // eslint-disable-next-line
  }, [history, groupedBy]);

  return (
    <div className="p-model-group-toggle">
      <div className="p-model-group-toggle__inner">
        <span className="p-model-group-toggle__label">Group by:</span>
        <div className="p-model-group-toggle__buttons">
          {buttons.map(label => (
            <button
              aria-label={`group by ${label}`}
              key={label}
              className={classNames("p-model-group-toggle__button", {
                "is-selected": groupedBy === label
              })}
              value={label}
              onClick={e => setGroupedBy(e.currentTarget.value)}
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
