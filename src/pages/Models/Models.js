import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ModelGroupToggle from "components/ModelGroupToggle/ModelGroupToggle";
import FilterTags from "components/FilterTags/FilterTags";
import UserIcon from "components/UserIcon/UserIcon";

import { getGroupedModelStatusCounts } from "app/selectors";

import "./_models.scss";

function pluralize(value, string) {
  if (value && (value === 0 || value > 1)) {
    return string + "s";
  }
  return string;
}

export default function Models() {
  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);

  // Grab filter from 'groupedby' query in URL and assign to variable
  // If it doesn't exist, fall back to grouping by status
  const location = useLocation();
  const queryStrings = queryString.parse(location.search);
  const groupedByFilter = queryStrings.groupedby || "status";

  // Set initial state using filter from URL
  const [groupedBy, setGroupedBy] = useState(groupedByFilter);
  // Add as an effect so UI is updated on each component render (e.g. Back button)
  useEffect(() => {
    setGroupedBy(groupedByFilter);
  }, [setGroupedBy, groupedByFilter]);

  const models = blocked + alert + running;
  return (
    <Layout>
      <Header>
        <div className="models__header">
          <div className="models__count">
            {`${models} ${pluralize(
              models,
              "model"
            )}: ${blocked} blocked, ${alert} ${pluralize(
              alert,
              "alert"
            )}, ${running} running`}
          </div>
          <ModelGroupToggle setGroupedBy={setGroupedBy} groupedBy={groupedBy} />
          <FilterTags />
          <UserIcon />
        </div>
      </Header>
      <div className="l-content">
        <div className="models">
          <ModelTableList groupedBy={groupedBy} />
        </div>
      </div>
    </Layout>
  );
}
