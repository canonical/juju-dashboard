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

    Object.entries(statusList).forEach(([groupName, statuses]) => {
      const statement = Object.values(statuses).map((status) => {
        incrementCount(status.count);
        return (
          <span
            key={status.label}
            className={`status-icon is-${status.label.toLowerCase()}`}
          >{`${status.count} ${status.label}`}</span>
        );
      });
      proposedStatus = { groupName, statement, count };
    });
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
