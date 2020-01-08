import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

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

  const location = useLocation();
  // Grab filter from 'groupby' query in URL and assign to variable
  // If it doesn't exist, fall back to grouping by status
  const groupFilterFromQueryString =
    location.search.split("groupby=")[1] || "status";
  // Set variable as default state value
  const [groupedBy, setGroupedBy] = useState(groupFilterFromQueryString);
  // Listen for back button click and update groupedBy state accordingly
  window.onpopstate = function() {
    setGroupedBy(groupFilterFromQueryString);
  };

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
