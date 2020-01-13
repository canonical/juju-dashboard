import React, { useState } from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ModelGroupToggle from "components/ModelGroupToggle/ModelGroupToggle";
import FilterTags from "components/FilterTags/FilterTags";
import UserIcon from "components/UserIcon/UserIcon";

import { getGroupedModelStatusCounts } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);
  const [groupedBy, setGroupedBy] = useState("status");
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
