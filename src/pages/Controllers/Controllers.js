import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import { getControllerData, getModelCounts } from "app/selectors";
import { pluralize } from "app/utils";

import "./_controllers.scss";

export default function Controllers() {
  const controllerData = useSelector(getControllerData);
  const { machinesCount, applicationCount, unitCount } = useSelector(
    getModelCounts
  );

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
        { content: `${c.Public}`, className: "u-align--right u-capitalise" }
      ]
    }));

  return (
    <Layout>
      <div className="l-content">
        <div className="overview">
          <div className="row">
            <div className="col-4 overview__machines">
              <strong data-test="machine-count">
                {machinesCount} {pluralize(machinesCount, "machine")}
              </strong>
            </div>
            <div className="col-4 overview__applications">
              <strong data-test="application-count">
                {applicationCount} {pluralize(applicationCount, "application")}
              </strong>
            </div>
            <div className="col-4 overview__units">
              <strong data-test="unit-count">
                {unitCount} {pluralize(unitCount, "unit")}
              </strong>
            </div>
          </div>
        </div>
        <div className="controllers">
          <div className="l-controllers-table">
            <MainTable
              className={"u-table-layout--auto"}
              headers={headers}
              rows={rows}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
