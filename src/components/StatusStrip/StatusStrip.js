import React, { useState, useEffect } from "react";
import { pluralize } from "app/utils";

import "./_status-strip.scss";

export default function StatusStrip({ statusList }) {
  const [status, setStatus] = useState({});

  useEffect(() => {
    let proposedStatus = {};
    let count = 0;

    function incrementCount(incrementBy) {
      count = count + incrementBy;
    }

    for (const [groupName, statuses] of Object.entries(statusList)) {
      const statement = Object.values(statuses).map((status) => {
        incrementCount(status.count);
        return (
          <span
            key={status.label}
            className={`status-icon is-${status.label.toLowerCase()}`}
          >{`${status.label}: ${status.count}`}</span>
        );
      });
      proposedStatus = { groupName, statement, count };
    }
    setStatus(proposedStatus);
  }, [statusList]);

  return (
    <div className="status-strip">
      {status.count > 0 && (
        <span>
          <strong>
            {status.count} {pluralize(status.count, status.groupName)}:
          </strong>{" "}
          <span className="status-strip__statement">{status.statement}</span>
        </span>
      )}
    </div>
  );
}
