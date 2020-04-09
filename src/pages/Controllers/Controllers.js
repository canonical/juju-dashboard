import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import { getControllerData } from "app/selectors";
import ControllersOverview from "./ControllerOverview/ControllerOverview";

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
      className: "u-align--right",
    },
    { content: "units", sortKey: "units", className: "u-align--right" },
    { content: "version", sortKey: "version", className: "u-align--right" },
    { content: "public", sortKey: "public", className: "u-align--right" },
  ];

  const rows =
    controllerData &&
    Object.values(controllerData).map((c) => ({
      columns: [
        { content: c.path },
        { content: `${c.location.cloud}/${c.location.region}` },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: `${c.Public}`, className: "u-align--right u-capitalise" },
      ],
    }));

  return (
    <Layout>
      <Header></Header>
      <div className="l-content controllers">
        <ControllersOverview />
        <div className="l-controllers-table u-overflow--scroll">
          <h5>Controller status</h5>
          <MainTable headers={headers} rows={rows} />
        </div>
      </div>
    </Layout>
  );
}
