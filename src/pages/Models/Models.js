import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ModelGroupToggle from "components/ModelGroupToggle/ModelGroupToggle";
import FilterTags from "components/FilterTags/FilterTags";
import UserIcon from "components/UserIcon/UserIcon";

import { getGroupedModelStatusCounts, getModelData } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  // Grab filter from 'groupedby' query in URL and assign to variable
  const history = useHistory();
  const location = useLocation();
  const queryStrings = queryString.parse(location.search);
  // If it doesn't exist, fall back to grouping by status
  const groupedByFilter = queryStrings.groupedby || "status";
  // Set initial state using filter from URL
  const [groupedBy, setGroupedBy] = useState(groupedByFilter);
  // Assign updated filter back to queryStrings obj
  queryStrings.groupedby = groupedBy;
  // Stringify the obj again to push back to URL
  const updatedQs = queryString.stringify(queryStrings);
  // Add as an effect so UI is updated on each component render (e.g. Back button)
  useEffect(() => {
    history.push({
      pathname: "/models",
      search: groupedBy === "status" ? null : updatedQs
    });
  }, [history, groupedBy, updatedQs]);

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);
  const models = blocked + alert + running;

  const modelData = useSelector(getModelData);

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
          <FilterTags modelData={modelData} />
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
