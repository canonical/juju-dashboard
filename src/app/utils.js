import React from "react";

export const generateStatusIcon = (status, count) => {
  let statusClass = status ? `is-${status.toLowerCase()}` : "";
  let countValue = "";
  if (count !== undefined) {
    countValue = ` (${count})`;
  }
  return (
    <span className={"status-icon " + statusClass}>
      {status}
      {countValue}
    </span>
  );
};

export const generateSpanClass = (className, value) => {
  return <span className={className}>{value}</span>;
};

/**
  Returns the status for the application.
  @param {Object} application The application to check the status of in the
    format stored in the redux store.
  @returns {Object} The status of the application and any relevent messaging.
*/
export const getApplicationStatusGroup = application => {
  // Possible "blocked" or error states in application statuses.
  const blocked = ["blocked"];
  // Possible "alert" states in application statuses.
  const alert = ["unknown"];
  const status = application.status.status;
  const response = {
    status: "running",
    message: null
  };
  if (blocked.includes(status)) {
    response.status = "blocked";
  }
  if (alert.includes(status)) {
    response.status = "alert";
  }
  return response;
};

/**
  Returns the string status for the unit.
  @param {Object} unit The unit to check the status of in the format stored
    in the redux store.
  @returns {Object} The status of the unit and any relevent messaging.
*/
export const getUnitStatusGroup = unit => {
  const response = {
    status: "running",
    message: null
  };
  return response;
};
