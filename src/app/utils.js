import React from "react";

export const assignStatusIcon = status => {
  let statusClass = status ? `is-${status.toLowerCase()}` : "";
  return <span className={"status-icon " + statusClass}>{status}</span>;
};
