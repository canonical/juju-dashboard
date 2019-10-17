import React from "react";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import TableList from "components/TableList/TableList";
import ButtonToggle from "components/ButtonToggle/ButtonToggle";
import FilterTags from "components/FilterTags/FilterTags";

import "./_models.scss";

export default function Models() {
  return (
    <Layout>
      <Header>
        <div className="models__header">
          <div className="models__count">
            258 models: 4 blocked, 1 alert, 253 running
          </div>
          <ButtonToggle />
          <FilterTags />
          <i className="p-icon--user">Account icon</i>
        </div>
      </Header>
      <div className="p-strip is-shallow">
        <div className="row">
          <TableList />
        </div>
      </div>
    </Layout>
  );
}
