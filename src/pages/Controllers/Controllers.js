import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import { getControllerData } from "app/selectors";

import "./_controllers.scss";

export default function Controllers() {
  const controllerData = useSelector(getControllerData);

  const headers = [
    { content: "running", sortKey: "running" },
    { content: "cloud/region", sortKey: "cloud/region" },
    { content: "models", sortKey: "models", className: "u-align--right" },
    { content: "machines", sortKey: "machines", className: "u-align--right" },
    {
      content: "applications",
      sortKey: "applications",
      className: "u-align--right"
    },
    { content: "units", sortKey: "units", className: "u-align--right" },
    { content: "version", sortKey: "version", className: "u-align--right" },
    { content: "public", sortKey: "public", className: "u-align--right" }
  ];

  const rows =
    controllerData &&
    Object.values(controllerData).map(c => ({
      columns: [
        { content: <a href="_#">{c.path}</a> },
        { content: `${c.location.cloud}/${c.location.region}` },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: `${c.Public}`, className: "u-align--right" }
      ]
    }));

  return (
    <Layout>
      <div className="l-content">
        <div className="controllers">
          <MainTable
            className={"u-table-layout--auto"}
            headers={headers}
            rows={rows}
          />
        </div>
      </div>
    </Layout>
  );
}
