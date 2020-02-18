import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ModelGroupToggle from "components/ModelGroupToggle/ModelGroupToggle";
import FilterTags from "components/FilterTags/FilterTags";

import { getGroupedModelStatusCounts } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  // Grab filter from 'groupedby' query in URL and assign to variable
  const history = useHistory();
  const location = useLocation();
  const queryStrings = queryString.parse(location.search);
  // If it doesn't exist, fall back to grouping by status
  const groupedByFilter = queryStrings.groupedby || "status";

  const [groupModelsBy, setGroupModelsBy] = useState(groupedByFilter);
  if (groupModelsBy !== groupedByFilter) {
    setGroupModelsBy(groupedByFilter);
  }

  const updateFilterQuery = groupedBy => {
    queryStrings.groupedby = groupedBy;
    const updatedQs = queryString.stringify(queryStrings);
    history.push({
      pathname: "/models",
      search: groupedBy === "status" ? null : updatedQs
    });
    setGroupModelsBy(groupedBy);
  };

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);
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
          <ModelGroupToggle
            setGroupedBy={updateFilterQuery}
            groupedBy={groupModelsBy}
          />
          <FilterTags />
        </div>
      </Header>
      <div className="l-content">
        <div className="models">
          <ModelTableList groupedBy={groupModelsBy} />
        </div>
      </div>
    </Layout>
  );
}
